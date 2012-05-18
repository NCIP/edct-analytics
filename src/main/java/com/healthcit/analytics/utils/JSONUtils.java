package com.healthcit.analytics.utils;

import net.sf.json.JSONObject;

public class JSONUtils {
	public static Object getValue( JSONObject json, Object key ){
		if ( json.containsKey( key )) {
			return json.get( key );
		}
		else {
			return null;
		}
	}
}
