<jsp:directive.page contentType="text/javascript" session="false"
/><jsp:scriptlet>
  response.setHeader("Cache-Control", "max-age=3600");
</jsp:scriptlet
><jsp:directive.include file="./js/app.js"
/><jsp:directive.include file="./js/services/GtaaService.js"
/><jsp:directive.include file="./js/controllers/GtaaConceptController.js"
/>
