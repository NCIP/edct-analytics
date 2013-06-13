/*L
 * Copyright HealthCare IT, Inc.
 *
 * Distributed under the OSI-approved BSD 3-Clause License.
 * See http://ncip.github.com/edct-analytics/LICENSE.txt for details.
 */


package com.healthcit.analytics.servlet;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/login")
public class LoginController {
	
	@RequestMapping(method=RequestMethod.GET)
	public String handleLogin(@RequestParam("err") Integer err, Model model){
		if(err != null){
			switch(err) {
				case 1 : model.addAttribute("errorMessage", "Invalid login/password. Please try again."); break;
				case 2 : model.addAttribute("errorMessage", "You have no permissions to accsess required page. Please login with another user."); break;
			}
		}
		return "/../login";
	}
}
