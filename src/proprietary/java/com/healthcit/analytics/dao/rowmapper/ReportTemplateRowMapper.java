package com.healthcit.analytics.dao.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import com.healthcit.analytics.model.ReportTemplate;

public class ReportTemplateRowMapper implements RowMapper<Object> {
	
	private static String ID_COLUMN = "id";
	private static String TITLE_COLUMN = "title";
	private static String REPORT_COLUMN = "report";
	private static String TIMESTAMP_COLUMN = "timestamp";

	@Override
	public Object mapRow(ResultSet resultSet, int rowNum) throws SQLException {
		return new ReportTemplate( 
				resultSet.getLong(ID_COLUMN), 
				resultSet.getString(TITLE_COLUMN), 
				resultSet.getString(REPORT_COLUMN), 
				resultSet.getTimestamp(TIMESTAMP_COLUMN)
				);
	}

}
