package com.healthcit.analytics.model;

import java.sql.Timestamp;
import java.util.Date;

import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;

import com.healthcit.analytics.utils.JSONUtils;

public class ReportTemplate {
	private Long id;
	private String title;
	private String report;
	private Timestamp timestamp;
	
	private static String JSON_ID_FIELD = "id";
	private static String JSON_TITLE_FIELD = "title";
	private static String JSON_REPORT_FIELD = "report";
	private static String JSON_TIMESTAMP_FIELD = "timestamp";
	
	/**
	 * Default constructor
	 */
	public ReportTemplate(){
	}
	
	/**
	 * Explicit constructor
	 * @return
	 */
	public ReportTemplate(Long id, String title, String report, Timestamp timestamp){
		this.id = id;
		this.title = title;
		this.report = report;
		this.timestamp = timestamp;
	}
	
	/**
	 * Explicit constructor (parameter is a JSONObject)
	 * @return
	 */
	public ReportTemplate( JSONObject json ){
		if ( json != null )
		{
			Object id = JSONUtils.getValue( json, JSON_ID_FIELD );
			this.id = ( NumberUtils.isNumber(id + "") ? NumberUtils.createLong( id.toString() ) : null );
			this.title = ( String )JSONUtils.getValue( json, JSON_TITLE_FIELD );
			Object report = (( JSONObject )JSONUtils.getValue( json, JSON_REPORT_FIELD ));
			this.report = report == null ? null : report.toString();
			this.timestamp = ( Timestamp )JSONUtils.getValue( json, JSON_TIMESTAMP_FIELD );
		}
	}
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public JSONObject getJSONReport() {
		return StringUtils.isEmpty(report) ? null : JSONObject.fromObject( report );
	}
	public Date getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(Timestamp timestamp) {
		this.timestamp = timestamp;
	}
	public String getReport() {
		return report;
	}	
	public void setReport(String reportString) {
		this.report = reportString;
	}
	
	public boolean isEmpty(){
		return ( StringUtils.isEmpty( this.report ) );
	}
	
	public JSONObject toJSON(){
		
		JSONObject json = new JSONObject();
		
		json.put( JSON_ID_FIELD, this.id );
		
		json.put( JSON_TITLE_FIELD, this.title );
		
		json.put( JSON_REPORT_FIELD, getJSONReport() );
		
		if ( this.timestamp != null )
		{
			json.put( JSON_TIMESTAMP_FIELD, this.timestamp.toString() );
		}
		
		return json;
	}
}
