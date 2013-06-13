<%--L
  Copyright HealthCare IT, Inc.

  Distributed under the OSI-approved BSD 3-Clause License.
  See http://ncip.github.com/edct-analytics/LICENSE.txt for details.
L--%>

<%@page isThreadSafe="true" %>
<% 
	try{
		int duration = (request.getParameter("interval")!=null ? Integer.parseInt(request.getParameter("interval")) : 10000);
		Thread.sleep(duration);
   	} catch(InterruptedException ex){} 
%>
<%= "yes" %>
