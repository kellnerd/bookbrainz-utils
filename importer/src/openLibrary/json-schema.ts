// Based on https://github.com/internetarchive/openlibrary-client/tree/7e45d512d031970d2bf4f56ca23f6247f205a0a8/olclient/schemata
// Initial type definitions were generated using json-schema-to-typescript

export interface MinimalEntity {
	/** Relative URL which contains entity type and ID. */
	key: string;
}

export interface MinimalAuthor extends MinimalEntity {
	key: `/authors/OL${number}A`;
}

export interface MinimalWork {
	key: `/works/OL${number}W`;
};

export interface Author extends MinimalAuthor {
	name: string;
	type: {
		key: '/type/author';
	};
	alternate_names?: string[];
	bio?: TextBlock;
	birth_date?: string;
	death_date?: string;
	/**
	 * @example "England, U.K."
	 */
	location?: string;
	date?: string;
	entity_type?: 'person' | 'org' | 'event';
	fuller_name?: string;
	personal_name?: string;
	title?: string;
	photos?: number[];
	links?: Link[];
	remote_ids?: AuthorIdentifiers;
	/**
	 * @deprecated Not many authors have this property.
	 * Should be moved to {@linkcode links} and/or {@linkcode AuthorIdentifiers.wikidata}.
	 */
	wikipedia?: string;
	revision: number;
	latest_revision?: number;
	created?: InternalDatetime;
	last_modified: InternalDatetime;
}

export interface Work extends MinimalWork {
	title: string;
	subtitle?: string;
	type: {
		key: '/type/work';
	};
	authors?: AuthorRole[];
	covers?: number[];
	links?: Link[];
	/**
	 * Unsure what this is for, deprecate?
	 */
	id?: number;
	lc_classifications?: string[];
	subjects?: string[];
	first_publish_date?: string;
	description?: TextBlock;
	notes?: TextBlock;
	revision: number;
	latest_revision?: number;
	created?: InternalDatetime;
	last_modified: InternalDatetime;
	[key: string]: unknown;
}

export interface AuthorIdentifiers {
	wikidata?: `Q${number}`;
	viaf?: `${number}`;
	[key: string]: string;
}

export interface Edition extends MinimalEntity {
	key: `/books/OL${number}M`;
	title: string;
	subtitle?: string;
	type: {
		key: '/type/edition';
	};
	authors?: MinimalAuthor[];
	works: [MinimalWork];
	identifiers?: Record<string, string>;
	isbn_10?: string[];
	isbn_13?: string[];
	/** Library of Congress Control Numbers, linkable via https://lccn.loc.gov/<lccn> */
	lccn?: string;
	/** Links to the Internet Archive record via https://archive.org/details/<ocaid> */
	ocaid?: string;
	/** OCLC Online Computer Library Center / WorldCat id, linkable via https://www.worldcat.org/oclc/<oclc_number> */
	oclc_numbers?: string[];
	local_id?: string[];
	covers?: number[];
	links?: Link[];
	languages?: Language[];
	/** Translated from original language(s) */
	translated_from?: Language[];
	/** The title of the original language work */
	translation_of?: string;
	/** Author credit, inferred from work if missing? */
	by_statement?: string;
	/**
	 * @example "300 grams", "0.3 kilos", "12 ounces", "1 pounds"
	 */
	weight?: string;
	/**
	 * @example "1st ed.", "2000 edition"
	 */
	edition_name?: string;
	number_of_pages?: number;
	pagination?: string;
	/**
	 * @example "5.4 x 4.7 x 0.2 inches", "21 x 14.8 x 0.8 centimeters"
	 */
	physical_dimensions?: string;
	/**
	 * @example "Paperback", "Hardcover", "Spiral-bound"
	 */
	physical_format?: string;
	/**
	 * @example "1992"
	 */
	copyright_date?: string;
	/**
	 * The MARC21 country code. See https://www.loc.gov/marc/countries/cou_home.html
	*
	* @example "enk", "gw", "flu"
	 */
	publish_country?: string;
	/**
	 * The publication date in Extended Date/Time Format (EDTF) -- https://www.loc.gov/standards/datetime/
	 *
	 * @example "2017", "2017-07", "2017-07-11"
	 */
	publish_date?: string;
	publish_places?: string[];
	publishers?: string[];
	contributions?: string[];
	dewey_decimal_class?: string[];
	genres?: string[];
	/**
	 * The Library of Congress Classification number. See https://www.loc.gov/catdir/cpso/lcc.html
	 * We include the imprint date as the last four digits.
	 *
	 * @example "BS571.5 .S68 1995", "Z673.D62 C65 1994"
	 */
	lc_classifications?: string[];
	other_titles?: string[];
	series?: string[];
	source_records?: string[];
	subjects?: string[];
	work_titles?: string[];
	table_of_contents?: unknown[];
	description?: TextBlock;
	first_sentence?: TextBlock;
	notes?: TextBlock;
	revision: number;
	latest_revision?: number;
	created?: InternalDatetime;
	last_modified: InternalDatetime;
}

export interface AuthorRole {
	type: {
		key: '/type/author_role';
	};
	author: MinimalAuthor;
	role?: string;
	as?: string;
}

export interface InternalDatetime {
	type: '/type/datetime';
	value: string;
}

/**
 * A type based on the list of MARC21 language codes. See https://www.loc.gov/marc/languages/
 *
 * @example "/languages/eng", "/languages/ger"
 */
export interface Language {
	key: `/languages/${string}`;
}

export interface Link {
	url: string;
	title: string;
	type?: {
		key: '/type/link';
	};
}

export interface TextBlock {
	type: '/type/text';
	value: string;
}
