package com.healthcit.analytics.businessdelegates;

import java.io.OutputStream;
import java.util.Arrays;

import com.healthcit.analytics.dao.CouchDBDaoUtils;
import com.healthcit.cacure.dao.CouchDBDao;
import com.healthcit.cacure.data.utils.CouchJSONConverter;
import com.healthcit.cacure.data.utils.CouchJSONConverter.OutputFormat;

public class OwnerDataManager
{
	private OutputFormat outputFormat = OutputFormat.JSON;
	
	public OwnerDataManager()
	{
		
	}
	
	public OwnerDataManager(OutputFormat format)
	{
		this.outputFormat = format;
	}
	public void getEntitiesData(String[] ownerIds, OutputStream os) throws Exception
	{
//		String xml =null;
//		Collection entityIds = JSONArray.toCollection(entityIdsJSON);
		CouchDBDao couchDb = CouchDBDaoUtils.getCouchDBDaoInstance();
		CouchJSONConverter jsonConverter = new CouchJSONConverter(outputFormat);
		jsonConverter.setOutputStream(os);
		couchDb.getDocsByOwnersAndModules(Arrays.asList(ownerIds), os);
	}
}