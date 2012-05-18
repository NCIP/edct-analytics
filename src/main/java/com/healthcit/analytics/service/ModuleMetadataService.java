package com.healthcit.analytics.service;

import org.directwebremoting.annotations.RemoteMethod;
import org.directwebremoting.annotations.RemoteProxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthcit.analytics.businessdelegates.ModuleMetadataManager;

/**
 * Service performs the remote loading of all module metadata used by the application.
 */
@Service
@RemoteProxy(name="moduleMetadataService")
public class ModuleMetadataService {
	
	@Autowired
	ModuleMetadataManager moduleMetadataManager;
	
	/**
	 * Remote method used to load module metadata on the client side.
	 */
	@RemoteMethod
	public String loadModuleMetaData() throws Exception
	{
		return moduleMetadataManager.loadModuleMetaData();
	}
}
