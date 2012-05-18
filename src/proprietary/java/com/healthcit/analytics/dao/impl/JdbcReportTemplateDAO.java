package com.healthcit.analytics.dao.impl;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Locale;

import javax.sql.DataSource;

import org.apache.commons.lang.StringUtils;
import org.springframework.context.MessageSource;
import org.springframework.context.MessageSourceAware;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import com.healthcit.analytics.dao.ReportTemplateDao;
import com.healthcit.analytics.dao.rowmapper.ReportTemplateRowMapper;
import com.healthcit.analytics.model.ReportTemplate;
import com.healthcit.analytics.utils.Constants;

@SuppressWarnings("unused")
public class JdbcReportTemplateDAO implements MessageSourceAware, ReportTemplateDao {
	private MessageSource messageSource;
	private JdbcTemplate jdbcTemplate;
	
	@Override
	public void setMessageSource(MessageSource messageSource) 
	{
		this.messageSource = messageSource;
	}

    public void setDataSource(DataSource dataSource) 
    {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

	@Override
	public ReportTemplate getReportTemplateById(Long id) 
	{
		String sql = messageSource.getMessage(Constants.GET_REPORT_BY_ID_SQL, null, Locale.getDefault());
		
		List<Object> results = jdbcTemplate.query( sql, new Object[]{id}, new ReportTemplateRowMapper());
		
		return ( results.isEmpty() ? null : ( ReportTemplate )results.get( 0 ) );
		
	}

	@Override
	public ReportTemplate getReportTemplateByTitle(String title) 
	{
		String sql = messageSource.getMessage(Constants.GET_REPORT_BY_TITLE_SQL, null, Locale.getDefault());
		
		List<Object> results = jdbcTemplate.query( sql, new Object[]{StringUtils.lowerCase( title )}, new ReportTemplateRowMapper());
		
		return ( results.isEmpty() ? null : ( ReportTemplate )results.get( 0 ) );
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ReportTemplate> findAllReportTemplates() 
	{
		String sql = messageSource.getMessage(Constants.GET_REPORTS_SQL, null, Locale.getDefault());
		
		List<Object> results = jdbcTemplate.query( sql, new ReportTemplateRowMapper());
		
		List<? extends Object> list = results;
		
		return (List<ReportTemplate>)list;
	}

	@Override
	public int saveReportTemplate(ReportTemplate template) 
	{
		String sql = messageSource.getMessage(Constants.SAVE_NEW_REPORT_SQL, null, Locale.getDefault());
		
		int numRowsInserted = jdbcTemplate.update( sql, new Object[]{ template.getTitle(), template.getReport() } );
		
		return numRowsInserted;
	}

	@Override
	public int updateReportTemplateById(ReportTemplate template) 
	{
		String sql = messageSource.getMessage(Constants.UPDATE_REPORT_BY_ID_SQL, null, Locale.getDefault());
		
		int numUpdatedRows = jdbcTemplate.update( sql, new Object[]{ template.getTitle(), template.getReport(), template.getId() } );
		
		return numUpdatedRows;
	}

	@Override
	public int updateReportTemplateByTitle(ReportTemplate template) 
	{
		String sql = messageSource.getMessage(Constants.UPDATE_REPORT_BY_TITLE_SQL, null, Locale.getDefault());
		
		int numUpdatedRows = jdbcTemplate.update( sql, new Object[]{ template.getReport(), template.getTitle() } );
		
		return numUpdatedRows;
	}

	@Override
	public int deleteReportTemplateById(Long id) 
	{
		String sql = messageSource.getMessage(Constants.DELETE_REPORT_BY_ID_SQL, null, Locale.getDefault());
		
		int numUpdatedRows = jdbcTemplate.update( sql, new Object[]{ id } );
		
		return numUpdatedRows;
	}
}
