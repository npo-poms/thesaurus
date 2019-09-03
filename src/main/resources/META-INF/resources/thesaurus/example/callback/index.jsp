<jsp:directive.page session="false" contentType="application/json" pageEncoding="UTF-8" />
<jsp:directive.page import="java.io.BufferedReader" />
{
  "info": "The gtaa popup posted to me, and I received this",
  "my_url": "<%=request.getRequestURL().toString()%>",
  "headers": {
    "contentType": "<%=request.getContentType() %>",
    "method": "<%=request.getMethod() %>",
    "origin": "<%=request.getHeader("Origin") %>",
    "referer": "<%=request.getHeader("Referer") %>"
  },
  "body":
  <%BufferedReader br = request.getReader();
    String line;
    while((line = br.readLine()) != null) {
      out.println(line);
    }
  %>
}
