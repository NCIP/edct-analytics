package com.healthcit.analytics.servlet;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLDecoder;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.healthcit.analytics.utils.Constants;


/**
 * ExcelExportServlet handles converting HTML table structures into Excel format.
 * @author Oawofolu
 *
 */
public class ExcelExportServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String EXCEL_CONTENT_DISPOSITION_VALUE="attachment; filename=export.xls";
	private static final String HTML_TABLE_PARAMETER = "htmlTable";
	private static Logger log = Logger.getLogger( ExcelExportServlet.class );
	/**
	 * The doPost method of the servlet. <br>
	 * Handles taking an HTML string as a parameter and converting it into Excel format.
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {		

		// set the Content Type
		response.setContentType(Constants.EXCEL_CONTENT_TYPE);
		
		// set the response headers
	    response.setHeader(Constants.CONTENT_DISPOSITION, EXCEL_CONTENT_DISPOSITION_VALUE);
	    
	    response.addHeader(Constants.PRAGMA_HEADER, Constants.NO_CACHE);
	    
	    response.setHeader(Constants.CACHE_CONTROL_HEADER, Constants.NO_CACHE);
	    
	    response.setDateHeader (Constants.EXPIRES_HEADER, 2);

	    // get the HTML Table parameter
		String htmlTableString = URLDecoder.decode( request.getParameter( HTML_TABLE_PARAMETER ), "UTF-8" );
				
		// write out the response		
		PrintWriter out = response.getWriter();
		
		out.println( htmlTableString );
		
		log.debug( htmlTableString );
		
		out.flush();
		
		out.close();
	}
}
