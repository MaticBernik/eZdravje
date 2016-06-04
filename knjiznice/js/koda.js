
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";



function dodajMeritveVitalnihZnakov(ehrId,datumInUra,telesnaVisina,telesnaTeza,telesnaTemperatura,sistolicniKrvniTlak,diastolicniKrvniTlak,nasicenostKrviSKisikom,merilec) {
	sessionId = getSessionId();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo " +
      "label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Struktura predloge je na voljo na naslednjem spletnem naslovu:
      // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: merilec
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        $("#dodajMeritveVitalnihZnakovSporocilo").html(
              "<span class='obvestilo label label-success fade-in'>" +
              res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
		    }
		});
	}
}
/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
var done=0; 
var error=0; 
var ehrident;
function generirajPodatke(stPacienta) {
  var sessionId = getSessionId();    
  var ehrId = "";

  // TODO: Potrebno implementirati
  var ime="";
  var priimek="";
  var datumRojstva="";

  
  if(stPacienta==1){
    ime="Robert";
    priimek="Slabsa";
    datumRojstva="1980-03-10T11:03";  
  }else if(stPacienta==2){
    ime="Ana";
    priimek="Optimum";
    datumRojstva="1990-06-10T09:03"; 
  }else if(stPacienta==3){
    ime="David";
    priimek="Kriticno";
    datumRojstva="1951-02-06T03:13";   
  }else{
      console.log("Metoda generirajPodatke je bila pripravljena za do 3 paciente!");
  }
  
  $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        ehrId = data.ehrId;
		        console.log("ehrId");
		        ehrident[stPacienta-1]=ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#preberiEHRid").val(ehrId);
		                }
		                error[stPacienta-1]=0;
		            },
		            error: function(err) {
		            	error[stPacienta-1]=JSON.parse(err.responseText).userMessage;
		            	//error=1;
		            }
		        });
		        
		        if(stPacienta==1){
		            dodajMeritveVitalnihZnakov(ehrId,"2016-05-29T07:30","169","67","37.1","128","82","98",ime+" "+priimek);
		            dodajMeritveVitalnihZnakov(ehrId,"2016-06-01T07:30","169","68","37.0","129","83","97",ime+" "+priimek);
		            dodajMeritveVitalnihZnakov(ehrId,"2016-06-04T07:30","169","71","37.1","130","84","96",ime+" "+priimek);
		        }else if(stPacienta==2){
		            dodajMeritveVitalnihZnakov(ehrId,"2016-06-04T07:30","180","70","37.0","115","70","99",ime+" "+priimek);
		            dodajMeritveVitalnihZnakov(ehrId,"2016-06-03T07:30","180","70","37.0","115","70","99",ime+" "+priimek);
		            dodajMeritveVitalnihZnakov(ehrId,"2016-06-02T07:30","180","70","37.0","115","70","99",ime+" "+priimek);
		            dodajMeritveVitalnihZnakov(ehrId,"2016-06-01T07:30","180","70","37.0","115","70","99",ime+" "+priimek);  
		        }else if(stPacienta==3){
		           dodajMeritveVitalnihZnakov(ehrId,"2016-06-04T07:30","171","53","39.7","141","91","94","Alojzija Kriticno");
		           dodajMeritveVitalnihZnakov(ehrId,"2016-05-04T07:30","171","58","39.7","141","91","94","Alojzija Kriticno");
		        } 
		        
	            done=done+1;
	            if(done>=3){
	            	$("#kreirajSporocilo").html("");
	            	var id1=ehrident[0];
	            	var id2=ehrident[1];
	            	var id3=ehrident[2];
	            	if(error[0]==0){
    					$("#kreirajSporocilo").html($("#kreirajSporocilo").html()+"<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno kreiran EHR '" +
                          id1 + "'.</span>");
    	
    				}else{
    					$("#kreirajSporocilo").html($("#kreirajSporocilo").html()+
    					"<span class='obvestilo label " +
                		"label-danger fade-in'>Napaka '" +
                		 error[0] + "'!");
					 }
					 if(error[1]==0){
    					$("#kreirajSporocilo").html($("#kreirajSporocilo").html()+"<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno kreiran EHR '" +
                          id1 + "'.</span>");
    	
    				}else{
    					$("#kreirajSporocilo").html($("#kreirajSporocilo").html()+
    					"<span class='obvestilo label " +
                		"label-danger fade-in'>Napaka '" +
                		 error[1] + "'!");
					 }
					 if(error[2]==0){
    					$("#kreirajSporocilo").html($("#kreirajSporocilo").html()+"<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno kreiran EHR '" +
                          id1 + "'.</span>");
    	
    				}else{
    					$("#kreirajSporocilo").html($("#kreirajSporocilo").html()+
    					"<span class='obvestilo label " +
                		"label-danger fade-in'>Napaka '" +
                		 error[2] + "'!");
					 }
	            }

		    }
		});
  return ehrId;
}

function generirajTestnePodatke(){
	error=[0,0,0];
	ehrident=["","",""];
	done=0;
    generirajPodatke(1); //ad4903e9-2be4-49ff-b425-fed443df9193
    generirajPodatke(2); //58805faf-b05a-4be5-8d22-5d4c3b09b031
    generirajPodatke(3); //d5457738-78e0-48a9-bcfd-9535e23fc8b3 


    /*id1=ehrident;
    if(error==0){
    $("#kreirajSporocilo").html($("#kreirajSporocilo").html()+"<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno kreiran EHR '" +
                          id1 + "'.</span>");
    	
    }else{
    	$("#kreirajSporocilo").html($("#kreirajSporocilo").html()+
    	"<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka '" +
                    error + "'!");
    }
    var id2=generirajPodatke(2); //58805faf-b05a-4be5-8d22-5d4c3b09b031
    id2=ehrident;
    if(error==0){
    $("#kreirajSporocilo").html($("#kreirajSporocilo").html()+"<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno kreiran EHR '" +
                          id2 + "'.</span>");
    	
    }else{
    	$("#kreirajSporocilo").html($("#kreirajSporocilo").html()+
    	"<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka '" +
                    error + "'!");
    }
    var id3=generirajPodatke(3); //d5457738-78e0-48a9-bcfd-9535e23fc8b3 
    id3=ehrident;
    if(error==0){
    $("#kreirajSporocilo").html($("#kreirajSporocilo").html()+"<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno kreiran EHR '" +
                          id3 + "'.</span>");
    	
    }else{
    	$("#kreirajSporocilo").html($("#kreirajSporocilo").html()+
    	"<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka '" +
                    error + "'!");
    }

	console.log(""+id1);
	console.log(""+id2);
	console.log(""+id3);*/
    return false;


}


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
