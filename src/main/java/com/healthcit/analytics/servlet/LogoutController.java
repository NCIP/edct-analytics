/*L
 * Copyright HealthCare IT, Inc.
 *
 * Distributed under the OSI-approved BSD 3-Clause License.
 * See http://ncip.github.com/edct-analytics/LICENSE.txt for details.
 */


/**
 * 
 */
package com.healthcit.analytics.servlet;

import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * Controller for managing logout action
 *
 */
@Controller
@RequestMapping("/logout")
public class LogoutController {
	
	@RequestMapping(method=RequestMethod.GET)
	public String logout(HttpSession session){
		session.invalidate();
		
		return "redirect:/";
	}
}
