/*L
 * Copyright HealthCare IT, Inc.
 *
 * Distributed under the OSI-approved BSD 3-Clause License.
 * See http://ncip.github.com/edct-analytics/LICENSE.txt for details.
 */


package com.healthcit.analytics.dao;

import java.util.List;

import com.healthcit.analytics.model.ReportTemplate;

public interface ReportTemplateDao {
	public List<ReportTemplate> findAllReportTemplates(Long userId);
	public ReportTemplate getReportTemplateById(Long id);
	public List<ReportTemplate> getReportTemplatesByTitle(String title);
	public void saveReportTemplate(ReportTemplate template);
	public int updateReportTemplateById(ReportTemplate template);
	public int updateReportTemplateByTitle(ReportTemplate template);
	public int deleteReportTemplateById(Long id);
}
