function (doc) {
	/* Regular questions */
	if ( doc.questions ) {
		for ( var questionId in doc.questions ) {
			emit( [ questionId, null, null, null, null ], null );
		}
	}
	
	/* Complex Tables */
	if ( doc.complex_tables ) {
		var complexTables = doc.complex_tables;
		for ( var complexTableId in complexTables ) {
			var rows = complexTables[ complexTableId ][ 'rows' ];
			var complexTableShortName = complexTables[ complexTableId ][ 'metadata' ][ 'short_name' ] || null;
			var identifyingColumn = complexTables[ complexTableId ][ 'metadata' ][ 'ident_column_uuid' ] || null;
			if ( rows ) {
				for ( var rowIndex = 0; rowIndex < rows.length; ++rowIndex ) {
					var row = rows[ rowIndex ];
					for ( var key in row ) {
						if ( key != 'rowId' ) {
							var questionId = key;
							emit( [questionId, 'COMPLEX', complexTableId, complexTableShortName, identifyingColumn ], null );
						}
					}
				}
			}
		}
	}
	
	/* Simple Tables */
	if ( doc.simple_tables ) {
		var simpleTables = doc[ 'simple_tables' ];
		for ( var simpleTableId in simpleTables ) {
			var simpleTableText = simpleTables[ simpleTableId ][ 'table_text' ];
			var simpleTableShortName = simpleTables[ simpleTableId ][ 'short_name' ];
			var simpleTableQuestions = simpleTables[ simpleTableId ][ 'questions' ];
			emit( [simpleTableId, 'SIMPLE', simpleTableId, simpleTableShortName, simpleTableId ], null );
			emit( ['ans'+simpleTableId+'ans', 'SIMPLE', simpleTableId, simpleTableShortName, simpleTableId ], null );
		}
	}
}