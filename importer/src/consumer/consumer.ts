/*
 * Copyright (C) 2018  Shivam Tripathi
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */


import * as Errors from '../helpers/errors.ts';
import type {ImportQueue, QueuedEntity} from '../queue.ts';
import BookBrainzData from 'bookbrainz-data';
import _ from 'lodash';
import config from '../helpers/config.js';
import consumeRecord from './consumeRecord.ts';
import log from '../helpers/logger.ts';


/**
 * consumerPromise - Instance function called to consume from the RMQ queues
 * @param {Object} objArgs - Arguments passed
 * @param {number} objArgs.id - Worker Id
 * @param {ImportQueue} objArgs.queue - Message queue connection
 * @returns {Promise} - A never fulfilling promise, as consumer is supposed to
 * 		run forever
 **/
function consumerPromise({id, queue}: {id: number; queue: ImportQueue}) {
	log.info(`[WORKER::${id}] Running consumer number ${id}`);

	// TODO: Why do we have to call `.default` here to make TS happy!?
	const orm = BookBrainzData.default(config('database'));
	const importRecord = _.partial(orm.func.imports.createImport, orm);
	const {retryLimit} = config('import');

	// A never resolving promise as consumer is supposed to run forever
	return new Promise<never>(() => {
		if (id !== 0 && !id) {
			Errors.undefinedValue('Consumer instance:: Worker Id undefined');
		}

		async function entityHandler(record: QueuedEntity) {
			log.info(`[CONSUMER::${id}] Received entity ${record.originId}, running handler...`);

			// Attempts left for this message
			let attemptsLeft = retryLimit;

			// Manages consume record retries
			while (attemptsLeft > 0) {
				// Function repeated upon transaction error for retries times
				// Manages async record consumption
				try {
					if (attemptsLeft < retryLimit) {
						log.info('--- Restarting import process... ---');
					}

					// eslint-disable-next-line no-await-in-loop -- this is a retry loop
					const {errorType, errMsg} = await consumeRecord({
						importRecord,
						workerId: id,
						...record
					});

					switch (errorType) {
						case Errors.NONE:
							log.info(`[CONSUMER::${id}] Read message successfully:\n${record}`);
							return true;

						case Errors.INVALID_RECORD:
						case Errors.RECORD_ENTITY_NOT_FOUND:
							// In case of invalid records, we don't try again
							log.warn(`[CONSUMER::${id}] ${errorType} :: ${errMsg} [skipping]`);
							return false;

						case Errors.TRANSACTION_ERROR:
							// In case of transaction errors, we retry a number of times before giving up
							attemptsLeft--;

							// Issue a warning in case of transaction error
							log.warn(
								`[CONSUMER::${id}] ${errorType} :: ${errMsg} [retry, ${attemptsLeft} attempts left]`
							);

							break;

						default: {
							throw new Error('Undefined response while importing');
						}
					}
				}
				catch {
					log.error(`${Errors.IMPORT_ERROR}\n ${JSON.stringify(record)}`);
				}
			}

			log.info('No more attempts left, giving up');
			return false;
		}

		// Connection related errors would be handled on the queue side
		queue.onData(entityHandler);
		log.debug('Consumer registered, waiting for messages...');
	});
}

export default consumerPromise;
