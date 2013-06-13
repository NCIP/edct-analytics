/*L
 * Copyright HealthCare IT, Inc.
 *
 * Distributed under the OSI-approved BSD 3-Clause License.
 * See http://ncip.github.com/edct-analytics/LICENSE.txt for details.
 */


package com.healthcit.analytics.utils;

import java.util.ResourceBundle;

public class PropertyUtils {

	
	private static ResourceBundle properties = ResourceBundle.getBundle( "application" );
	
	/* Gets the property with the specified key */
	public static String getProperty( String key )
	{
		String value = null;
		try {
			value = properties.getString( key );
		} catch ( Exception ex ){}
		
		return value;
	}
}
