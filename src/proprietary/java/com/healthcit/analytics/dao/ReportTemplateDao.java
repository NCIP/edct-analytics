package com.healthcit.analytics.dao;

import java.util.List;

import com.healthcit.analytics.model.ReportTemplate;

public interface ReportTemplateDao {
	public List<ReportTemplate> findAllReportTemplates();
	public ReportTemplate getReportTemplateById(Long id);
	public ReportTemplate getReportTemplateByTitle(String title);
	public int saveReportTemplate(ReportTemplate template);
	public int updateReportTemplateById(ReportTemplate template);
	public int updateReportTemplateByTitle(ReportTemplate template);
	public int deleteReportTemplateById(Long id);
}
