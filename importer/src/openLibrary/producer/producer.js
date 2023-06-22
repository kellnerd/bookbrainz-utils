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


import * as Error from '../../helpers/errors.js';
import {Queue} from '../../queue/index.js';
import fs from 'fs';
import {isNotDefined} from '../../helpers/utils.js';
import log from '../../helpers/logger.js';
import parser from './parser.js';
import readline from 'readline';


/**
 * readLine - Function which takes in instanceArgs and processes them.
 * @param {Object} obj - Primary argument
 * @param {Promise} obj.init - Connection promise
 * @param {number} obj.id - Numerical Id of the worker process running this
 * 		instance
 * @param {string} obj.base - This is path to the file to be processed
 **/
function readLine({base, id, init}) {
	if (isNotDefined(base)) {
		Error.undefinedValue('producerPromise:: File path (base args).');
	}

	if (id !== 0 && isNotDefined(id)) {
		Error.undefinedValue('producerPromise:: Worker Id undefined.');
	}

	// Errors related to init value will be handled on the queue side
	const queue = new Queue(init);

	const fileName = base.split('/').pop();
	log.info(`[WORKER::${id}] Running instance function on ${fileName}.`);

	const rl = readline.createInterface({
		input: fs.createReadStream(base)
	});

	let count = 0;

	rl.on('line', line => {
		count++;
		try {
			// According to details at https://openlibrary.org/developers/dumps
			// Tab separated values in the following order
			// 		➜ type - type of record (/type/edition, /type/work etc.)
			// 		➜ key - unique key of the record. (/books/OL1M etc.)
			// 		➜ revision - revision number of the record
			// 		➜ last_modified - last modified timestamp
			// 		➜ JSON - the complete record in JSON format
			const record = line.split('\t');

			const source = 'OPENLIBRARY';
			const json = JSON.parse(record[4]);
			const OLType = record[0].split('/')[2];
			const data = parser(OLType, json);
			const originId = record[1].split('/')[2];
			const lastEdited = record[3];

			log.log(`WORKER${id}:: Pushing record ${count}`);
			queue.push({
				data,
				entityType: data.entityType,
				lastEdited: lastEdited || data.lastEdited,
				originId: originId || data.originId,
				source
			});
		}
		catch (err) {
			log.warning(
				`Error in ${fileName} in line number ${count}.`,
				'Skipping. Record for reference: \n [[',
				line, ']]'
			);
		}
	});

	return new Promise((resolve) => {
		rl.on('close', () => resolve({
			connection: init,
			id,
			workerCount: count
		}));
	});
}

export default readLine;
