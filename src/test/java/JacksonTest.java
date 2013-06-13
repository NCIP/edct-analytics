/*L
 * Copyright HealthCare IT, Inc.
 *
 * Distributed under the OSI-approved BSD 3-Clause License.
 * See http://ncip.github.com/edct-analytics/LICENSE.txt for details.
 */


import java.io.FileInputStream;
import java.io.FileOutputStream;

import com.healthcit.cacure.data.utils.CouchJSONConverter;





public class JacksonTest
{
	public static void main(String[] args) throws Exception
	{
		CouchJSONConverter jc = new CouchJSONConverter(CouchJSONConverter.OutputFormat.JSON);
		//CouchJSONConverter jc = new CouchJSONConverter(CouchJSONConverter.OutputFormat.XML);
		FileInputStream fis = new FileInputStream("C:\\temp\\json.txt");
		FileOutputStream fos = new FileOutputStream("C:\\temp\\json-changed.txt");
//		FileOutputStream fos = new FileOutputStream("C:\\temp\\dataExport.xml");
		jc.setInputStream(fis);
		jc.setOutputStream(fos);
		jc.convert();
		fos.flush();
		fis.close();
		fos.close();
		
	}
}
