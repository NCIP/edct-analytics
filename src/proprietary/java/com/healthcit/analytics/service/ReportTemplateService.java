package com.healthcit.analytics.service;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.log4j.Logger;
import org.directwebremoting.annotations.RemoteMethod;
import org.directwebremoting.annotations.RemoteProxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.healthcit.analytics.businessdelegate.ReportTemplateManager;
import com.healthcit.analytics.model.ReportTemplate;

@Service
@RemoteProxy(name="reportTemplateService")
public class ReportTemplateService {
	
	private static Logger log = Logger.getLogger( ReportTemplateService.class );
	
	@Autowired
	private ReportTemplateManager manager;
	
	public ReportTemplateService(){}
	
	@RemoteMethod
	public String getAllReportTemplates()
	{
		JSONArray templates = manager.getAllReports();
		
		log.debug( "Size is " + templates.size() );
		
		return manager.getAllReports().toString();
	}

	@RemoteMethod
	public boolean checkIfReportTitleExists( String title )
	{
		boolean exists = manager.checkIfReportTitleExists( title );
		
		log.info(title + " exists: " + exists);
		
		return manager.checkIfReportTitleExists( title );
	}
	
	@RemoteMethod
	public Long saveOrUpdateReportTemplate( String templateString )
	{
		
		if ( StringUtils.isBlank( templateString )) return null;
		
		JSONObject template = ( JSONObject.fromObject( templateString ) );
		
		Long templateId = manager.saveOrUpdate( new ReportTemplate( template ) );
		
		log.info( "Template Id : " + (templateId==null ? "blank" : templateId) );
		
		return templateId;
	}
	
	@RemoteMethod
	public String deleteReportTemplate( String templateId ) 
	{
		if ( ! NumberUtils.isNumber( templateId ) ) return null;
		
		Long id = NumberUtils.createLong( templateId );
		
		boolean isDeleted = manager.delete( id );
		
		log.info ( "Template Id " + templateId + " deleted: " + isDeleted );
		
		return ( isDeleted ? templateId : null );		
	}
	
}
