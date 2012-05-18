package com.healthcit.analytics.businessdelegate;

import java.util.List;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.healthcit.analytics.dao.ReportTemplateDao;
import com.healthcit.analytics.model.ReportTemplate;

public class ReportTemplateManager {
	@Autowired
	private ReportTemplateDao reportTemplateDao;
		
	@Transactional(readOnly = true, propagation=Propagation.REQUIRED)
	public JSONArray getAllReports()
	{
		List<ReportTemplate> templates = reportTemplateDao.findAllReportTemplates();
		
		JSONArray jsonArray = new JSONArray();
		
		for ( ReportTemplate template : templates )
		{
			jsonArray.add( template.toJSON() );
		}
		
		return jsonArray;
	}
	
	@Transactional(readOnly = true, propagation=Propagation.REQUIRED)
	public JSONObject getReportById( Long id )
	{
		ReportTemplate reportTemplate = reportTemplateDao.getReportTemplateById(id);
		
		return JSONObject.fromObject(reportTemplate);
	}
	
	@Transactional(readOnly = true, propagation=Propagation.REQUIRED)
	public JSONObject getReportByTitle( String title )
	{
		ReportTemplate reportTemplate = reportTemplateDao.getReportTemplateByTitle(title);
		
		return JSONObject.fromObject(reportTemplate);
	}
	
	@Transactional(readOnly = true, propagation=Propagation.REQUIRED)
	public boolean checkIfReportTitleExists( String title )
	{
		return ( ! getReportByTitle( StringUtils.lowerCase( title ) ).isNullObject() );
	}
	
	@Transactional(readOnly = false, propagation=Propagation.REQUIRED)
	public Long saveOrUpdate( ReportTemplate reportTemplate )
	{
		if ( reportTemplate.isEmpty() ) return null;
		
		int numRows = 0;
		
		if ( reportTemplate.getId()==null ) 
		{
			numRows = reportTemplateDao.updateReportTemplateByTitle( reportTemplate );
		}
		else 
		{
			numRows = reportTemplateDao.updateReportTemplateById( reportTemplate );
		}
		
		if ( numRows == 0 )
		{
			numRows = reportTemplateDao.saveReportTemplate( reportTemplate );
			
			if ( numRows == 0 ) return null;
		}
		
		ReportTemplate savedTemplate = reportTemplateDao.getReportTemplateByTitle( reportTemplate.getTitle() );
		
		return ( savedTemplate == null ? null : savedTemplate.getId() );
		
	}
	
	public boolean delete( Long reportTemplateId ) 
	{
		if ( reportTemplateId == null ) return false;
		
		int numDeleted = reportTemplateDao.deleteReportTemplateById( reportTemplateId );
		
		return ( numDeleted != 0 );
	}
	
}
