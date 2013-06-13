/*L
 * Copyright HealthCare IT, Inc.
 *
 * Distributed under the OSI-approved BSD 3-Clause License.
 * See http://ncip.github.com/edct-analytics/LICENSE.txt for details.
 */

package com.healthcit.analytics.exceptions;

import com.google.visualization.datasource.base.DataSourceException;
import com.google.visualization.datasource.base.ReasonType;

/**
 * Custom exception thrown if a query is determined to be invalid.
 * @author Oawofolu
 *
 */
public class QueryInvalidException extends DataSourceException {

	private static final long serialVersionUID = 1589429989617261346L;
	
	public QueryInvalidException( String message ) {
		super( ReasonType.INTERNAL_ERROR, message );
	}

	public QueryInvalidException(ReasonType reasonType, String message) {
		super( reasonType, message );
	}

}
