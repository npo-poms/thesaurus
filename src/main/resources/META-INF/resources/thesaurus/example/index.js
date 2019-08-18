 $(document).ready(function () {
     var concept =   $("#concept");
     var person =   $("#person");
     var postmessage = $(".postmessage");
     var httppost    = $(".httppost");
     var callback = $("#callbackurl");

     function showPerson() {
         concept.hide(); person.show();
     }
     function showConcept() {
         concept.show(); person.hide();
     }
     $(".hide").hide();
     callback.hide();
     $("#usecallbackurl").change(function() {
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
     $("#schemes").change(function() {
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
         var options = {
             name: $('#name').val(),
             givenName: $('#givenName').val(),
             familyName: $('#familyName').val(),
             id: $('#id').val()
         };
          var schemes = $('#schemes').val();
          if (schemes.length > 0) {
              options.schemes = schemes;
          }

         var readonly = $("#readonly")[0].checked;
         if (! readonly) {
             options.jwt =  $("meta[name=jwt]").attr("content");
             options.jwtExpiraton = $("meta[name=jwtExpiration]").attr("content");

         }
         if ($("#usecallbackurl")[0].checked) {
             options.callbackService = $("#callbackurl").val();
         }
         gtaa.open(
             function (data) {
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
                     } else {
                         showConcept();
                         $('#id').val('');
                         $('#schemes').val('');
                     }
                 }
                 $('#json').val(JSON.stringify(JSON.parse(JSON.stringify(data)), null, 2));

             }, options
         );
     });
 });
