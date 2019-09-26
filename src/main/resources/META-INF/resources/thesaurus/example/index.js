 $(document).ready(function () {
     var concept = $("#concept");
     var person  = $("#person");
     var role    = $("#role");
     var postmessage = $(".postmessage");
     var httppost    = $(".httppost");
     var callback = $("#callbackurl");
     var schemes = $("#schemes");
     var readonly = $("#readonly");

     var jwt =  $("meta[name=jwt]").attr("content");
     var mustBeReadOnly = jwt === '';
     if (mustBeReadOnly) {
         readonly.prop("checked", true);
         readonly.prop("readonly", "readonly");
         readonly.prop("disabled", "disabled");
     } else {
         $("#loginlink").hide();
     }

     function showPerson() {
         concept.hide();
         person.show();
     }
     function showConcept() {
         concept.show();
         person.hide();
     }
     function open(iframe) {
         var options = {
             name: $('#name').val(),
             givenName: $('#givenName').val(),
             familyName: $('#familyName').val(),
             id: $('#id').val(),
             role: role.val(),
             iframe: iframe
         };
         var schemesVal = schemes.val();
         if (schemesVal.length > 0) {
             options.schemes = schemesVal;
         }

         var ro = readonly[0].checked;
         if (! ro) {
             options.jwt = jwt;
             options.jwtExpiraton = $("meta[name=jwtExpiration]").attr("content");
         }
         if ($("#usecallbackurl")[0].checked) {
             options.callbackService = callback.val();
         }
         gtaa.open(
             function (data) {
                 $("#modal").hide();
                 if (typeof data === 'object') {
                     var concept = data.concept;
                     if (concept) {
                         if (concept.objectType === "person") {
                             showPerson();
                             $('#givenName').val(concept.givenName);
                             $('#familyName').val(concept.familyName);
                             $('#name').val("");
                         } else if (concept.name) {
                             showConcept();
                             $('#name').val(concept.name);
                             $('#givenName').val("");
                             $('#familyName').val("");
                         }
                         $('#id').val(concept.id);
                         $('#schemes').val(concept.objectType);
                         if (data.role) {
                             role.val(data.role.name);
                         }
                     } else {
                         showConcept();
                     }


                 }
                 // this is a trick to format the json nicely.
                 $('#json').val(JSON.stringify(JSON.parse(JSON.stringify(data)), null, 2));

             }, options
         );

     }
     $(".hide").hide();
     callback.hide();
     callback.change(function() {
         if (this.checked) {
             callback.show();
             postmessage.hide();
             httppost.show();
         } else {
             callback.hide();
             postmessage.show();
             httppost.hide();
         }
     });
     schemes.change(function() {
         var arr = $(this).val();
         if (arr.length === 1 && arr[0] === 'person') {
             showPerson();
         } else {
             showConcept();
         }
     });
     $("#reset").click(function() {
         showConcept();
     });
     $("#open").click(function (event) {
         event.preventDefault();
         open();
     });
     $("#openmodal").click(function (event) {
         event.preventDefault();
         $("#modal").show();
         open("iframe");
     });
 });
