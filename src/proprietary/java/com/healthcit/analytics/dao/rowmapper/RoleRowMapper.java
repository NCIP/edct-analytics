/*L
 * Copyright HealthCare IT, Inc.
 *
 * Distributed under the OSI-approved BSD 3-Clause License.
 * See http://ncip.github.com/edct-analytics/LICENSE.txt for details.
 */


package com.healthcit.analytics.dao.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import com.healthcit.analytics.model.Role;

/**
 * <code>RowMapper</code> implementation for building <code>Role</code> objects.
 * 
 * @author Stanilsav Sedavnikh
 *
 */
public class RoleRowMapper implements RowMapper<Role>{

	@Override
	public Role mapRow(ResultSet rs, int index) throws SQLException {
		Long id = rs.getLong("id");
		String name = rs.getString("name");
		String displayName = rs.getString("display_name");
		return new Role(id, name, displayName);
	}

}
