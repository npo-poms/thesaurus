<!DOCTYPE HTML>
<html lang="nl">
<%@page
  import="nl.vpro.configuration.spring.PropertiesUtil,nl.vpro.thesaurus.Utils"
  pageEncoding="UTF-8"
  session="false"
%><%@ page import="java.util.Objects"
%><%@ page import="org.springframework.web.context.ContextLoader"
%><%@taglib
  prefix="c" uri="http://java.sun.com/jsp/jstl/core"
%><%
  request.setAttribute("properties",
    ((PropertiesUtil) Objects.requireNonNull(ContextLoader.getCurrentWebApplicationContext()).getBean("properties"))
      .getMap());
  response.setHeader("Cache-Control", "max-age=3600");
%><head>
  <title>GTAA</title>

  <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/poms-${requestScope.properties['media.gui.package.version']}.css"/>
  <link rel="stylesheet" href="./popup.css"/>
  <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.7.8/angular.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.7.8/angular-sanitize.js"></script>
  <script src="//angular-ui.github.io/bootstrap/ui-bootstrap-tpls-2.5.0.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/angular-ui-select/0.19.8/select.js"></script>

  <script>
      <%-- Communicate some stuff known by the server to javascript --%>
      var serverInfo = {
          ctx: "${pageContext.request.contextPath}",
          geoRoles: <%=Utils.buildJsonArray(nl.vpro.domain.media.GeoRoleType.class) %>,
          creditRoles: <%=Utils.buildJsonArray(nl.vpro.domain.media.RoleType.class) %>,
          gtaaSchemes: <%=Utils.buildJsonObject(nl.vpro.domain.gtaa.Scheme.class) %>
      }
  </script>
  <c:choose>
    <c:when test="${requestScope.properties['env'] == 'localhost'}">
      <script src="${pageContext.request.contextPath}/thesaurus/popup/js/app.js"></script>
      <script src="${pageContext.request.contextPath}/thesaurus/popup/js/services/GtaaService.js"></script>
      <script src="${pageContext.request.contextPath}/thesaurus/popup/js/controllers/GtaaConceptController.js"></script>
    </c:when>
    <c:otherwise>
      <script src="./index.js.jsp"> </script>
    </c:otherwise>
  </c:choose>
  <meta name="personUpdateService"  content="${requestScope.properties['npo_pageupdate_api.baseUrl']}/api/thesaurus/person"/>
  <meta name="conceptUpdateService" content="${requestScope.properties['npo_pageupdate_api.baseUrl']}/api/thesaurus/concept"/>
  <c:if test="${not empty param.apiKey}">
    <%-- This is not actually needed, for now the is no security on the /thesaurus end points --%>
    <script src="//cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
    <script src="${pageContext.request.contextPath}/npo-api/authentication.js"></script>
    <script>
      var npoAuthentication = new NpoApiAuthentication('${param.apiKey}', '${param.apiSecret}');
    </script>
  </c:if>



</head>
<body  ng-app="gtaaApp" ng-controller="GtaaConceptController" class="{{waiting ? 'waiting' :''}}">
  <form role="form" class="poms-form" name="conceptForm" >
    <div class="example-body">
      <div class="form-fields">
        <div class="row">
          <div class="col-12 conceptfields">
            <span id="spinner" ng-if="registerNewConcept">
              <img ng-if="waiting"
                   src="${pageContext.request.contextPath}/meeuw/spinner?color=%23ed6d1c" alt="Wachten.." height="64" width="64" />

            </span>
            <div ng-show="!registerNewConcept && !linkedPerson" class="poms-typeahead field col-8">
              <label for="searchValue">

                <jsp:text>Zoek binnen {{schemes.length == 1 ? 'het concept-schema' : "de concept-schema's"}} </jsp:text>
                <span ng-repeat="scheme in schemes">
                  {{$first ? '' : ($last ? ' en ' : ', ') }}
                  "{{scheme.label}}"
                </span>
                <jsp:text> van GTAA:</jsp:text>
              </label>

              <input type="text"
                     ng-class="{'waiting': suggestionsWaiting }"
                     ng-disabled="waiting"
                     id="searchValue"
                     name='searchValue'
                     ng-model="concept.$searchValue"
                     ng-value="concept.$searchValue"
                     uib-typeahead="item as item.value for item in suggest($viewValue, ${empty param.suggestions ? 50 : param.suggestions})"
                     typeahead-editable="true"
                     typeahead-min-length='1'
                     typeahead-template-url="${pageContext.request.contextPath}/thesaurus/popup/templates/suggest-item.html"
                     autocomplete="off"
                     typeahead-on-select="onSelect($item, $model, $label)"
                     typeahead-focus="true"
              />


            </div>
          </div>

        </div>
        <hr />
        <div ng-if="!registerNewConcept && concept.id">
          <gtaa-geographicname-form ng-if="isGeographicName(concept)"></gtaa-geographicname-form>
          <gtaa-creditable-form ng-if="isCreditable(concept)"></gtaa-creditable-form>
          <gtaa-concept-form ng-if="!isCreditable(concept) && !isGeographicName(concept)"></gtaa-concept-form>
        </div>
        <gtaa-register-form ng-if="registerNewConcept"></gtaa-register-form>

      </div>
    </div>

  </form>
  <div class="footer-container">
    <div class="footer modal-footer footer-buttons">
      <gtaa-register-footer ng-if="registerNewConcept"></gtaa-register-footer>
      <gtaa-display-footer ng-if="!registerNewConcept"></gtaa-display-footer>
    </div>
  </div>
</body>
</html>
