<%@page isThreadSafe="true" %>
<% 
	try{
		int duration = (request.getParameter("interval")!=null ? Integer.parseInt(request.getParameter("interval")) : 10000);
		Thread.sleep(duration);
   	} catch(InterruptedException ex){} 
%>
<%= "yes" %>