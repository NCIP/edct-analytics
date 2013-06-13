/*L
 * Copyright HealthCare IT, Inc.
 *
 * Distributed under the OSI-approved BSD 3-Clause License.
 * See http://ncip.github.com/edct-analytics/LICENSE.txt for details.
 */


package com.healthcit.analytics.businessdelegates;

import org.apache.commons.lang.StringUtils;

import com.healthcit.analytics.dao.CouchDBDaoUtils;
import com.healthcit.analytics.utils.PropertyUtils;
import com.healthcit.cacure.dao.CouchDBDao;

/**
 * Business delegate which handles the loading of module metadata.
 */
public class ModuleMetadataManager {
	
	private static CouchDBDao couchDb = CouchDBDaoUtils.getCouchDBDaoInstance();

	/**
	 * Loads module metadata
	 */
	public String loadModuleMetaData() throws Exception
	{
		String moduleMetadata = couchDb.getAttachment( PropertyUtils.getProperty( "couchDBModuleMetadataDoc" ) );
		
		if ( StringUtils.isEmpty( moduleMetadata ) ) throw new Exception("ERROR: Could not load the module metadata");
		
		else return moduleMetadata;
	}
}
