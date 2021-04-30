//Setup for global variables used in controller.js
var view = null;
var interval=null;

var credentials={ "username": "", "password":"" };

var registrationForm={ 
        "username": "", 
        "password": "" ,
        "passwordConfirm": "",
        "email" : "",
        "firstName": "",
        "lastName": "",
        "birthday": "",
        "pizza": "",
        "soda": ""
};

// Add the event listeners to the movement keys, the mouse cursor moving, and the click
function setupGame(difficulty){
	// stage=new Stage(document.getElementById('stage'), difficulty);

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', moveByKey);
        document.addEventListener('keyup', stopByKey);

        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('click', mouseClick);
        document.addEventListener('keypress', itemInteraction);
}

//Set the interval to start the game
function startGame(){
	interval=setInterval(function(){ stage.step(); stage.draw(); },100);
}

// Stop the interval so the game pauses without losing any progress
function pauseGame(){
	clearInterval(interval);
	interval=null;
}

// Movement event handler. Makes the player move.
function moveByKey(event){
        if(stage!=null){ //The game must exist to move

                stage.isPaused = false;
                var key = event.key;
                var moveMap = { 
                        'a': new Pair(-speed,0),
                        's': new Pair(0,speed),
                        'd': new Pair(speed,0),
                        'w': new Pair(0,-speed)
                };
                
                //The player must exist to move. Only wasd keys can move the player
                if (stage.player != null && key in moveMap){
                        keysPressed[key] = 1;
                }
                
                // Speed up the key that gets [pressed]
                for (possiblePressedKey in keysPressed){
                        if (keysPressed[possiblePressedKey] == 1){
                                stage.player.speedUp(moveMap[possiblePressedKey]);
                        }
                }
                
                //Check if the game if over when the player finishes a game
                checkForGameOver();
        }
}

// Stop the player when they release a key
function stopByKey(event){
        if(stage!=null){

                // Horizontal and vertical stopping is separated so that the player 
                var key = event.key;
                var horizontalMoveMap = { 
                        'a': new Pair(0,0),
                        'd': new Pair(0,0),
                };
                var varticalMoveMap = { 
                        's': new Pair(0,0),
                        'w': new Pair(0,0)
                };
                
                //Only stop the direction of the release key is stopped, but stop both if both are released at once.
                if (keysPressed[key] == 1){
                        
                        if (key in horizontalMoveMap){
                                stage.player.stopH(horizontalMoveMap[key]);
                        }
                        if (key in varticalMoveMap){
                                stage.player.stopV(varticalMoveMap[key]);
                        }
                        
                        keysPressed[key] = 0;
                }
                
                //Once again, check for game over
                checkForGameOver();
        }
}

// Move the mouse event handler
function mouseMove(event){
        if(stage!=null){
                
                var bounds = stage.canvas.getBoundingClientRect();
                var mx = Math.round(event.clientX - bounds.left);
                var my = Math.round(event.clientY - bounds.top);
                // mouse is in canvas, update player direction
                if(stage.player != null && mx >= 0 && mx <= stage.canvas.width && my >= 0 && my <= stage.canvas.height && !stage.isPaused){
                        stage.player.mx=mx;
                        stage.player.my=my;
                        
                        // x offset
                        var x = stage.player.cx;
                        if(stage.player.x < 400){
                                x = stage.player.x;
                        }
                        else if (stage.player.x > 700){
                                var offsetx = stage.player.x - 700;
                                x += offsetx;
                        }
                        
                        // y offset
                        var y = stage.player.cy;
                        if(stage.player.y < 400){
                                y = stage.player.y;
                        }
                        else if (stage.player.y > 700){
                                var offsety = stage.player.y - 700;
                                y += offsety;
                        }
                        stage.player.rotation = Math.atan2(my - y, mx - x);
                }
        }
}

// Click event handler
function mouseClick(event){
        if(stage!=null){

                var bounds = stage.canvas.getBoundingClientRect();
                var mousex = Math.round(event.clientX - bounds.left);
                var mousey = Math.round(event.clientY - bounds.top);
                // mouse is in canvas, set bullet direction
                if(stage.player != null && mousex >= 0 && mousex <= stage.canvas.width && mousey >= 0 && mousey <= stage.canvas.height){
                        var angle=stage.player.rotation;
                        
                        var vx=Math.cos(angle);
                        var vy=Math.sin(angle);
                        var velocity=new Pair(vx, vy);
                        stage.addBullet(stage.player, velocity);
                }
                
                checkForGameOver();
        }
}

// Item pickup event handler
function itemInteraction(event){
        if(stage!=null){

                var key = event.key;
                
                // When e is pressed
                if(key=='e'){
                        var c = stage.getAmmoCrate(10);
                        if( stage.player != null && c != null ){
                                stage.player.pickupAmmo(c);
                        }
                }
        }
}

// Login process
function login(){
        //Get the credentials from the login screen
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};

        // Ajax part
        $.ajax({
                method: "POST",
                url: "/api/auth/login",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));

                document.getElementById("usernameRegister").value = credentials.username;
                hideErrors();

        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
                
                // display error to user
                showErrors(err.responseJSON.error);
        });
}

// Get the information written in the registration html tags
function interpretRegistrationData(){
        var pizza = document.getElementById('pizza').value;
        var soda = document.getElementById('soda').value;

        registrationForm =  { 
		"username": $("#usernameRegister").val(), 
		"newPassword": $("#newPassword").val(), 
                "passwordConfirm": $("#confirmPassword").val(),
                "email" : $("#email").val(),
                "firstName": $("#firstName").val(),
                "lastName": $("#lastName").val(),
                "birthday": $("#birthday").val(),
                "pizza": pizza,
                "soda": soda
	};
}

// Register
function register(){
        
        //Get the info from the registration html tags
        interpretRegistrationData();

        //Ajax
        $.ajax({
                method: "POST",
                url: "/api/register",
                data: JSON.stringify({ 
                        "username":registrationForm.username, "password": registrationForm.newPassword, "confirmPassword": registrationForm.passwordConfirm, "email": registrationForm.email, 
                        "firstName": registrationForm.firstName, "lastName": registrationForm.lastName, "birthday": registrationForm.birthday,
                        "pizza": registrationForm.pizza, "soda": registrationForm.soda }),
		headers: { "Authorization": "Basic " + btoa(registrationForm.username + ":" + registrationForm.oldPassword) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                // If successful, go in
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));

                hideErrors();

        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
                
                // display error to user
                showErrors(err.responseJSON.error);
        });
}

// Get info to populate the profile screen
function getProfile(){
        
        interpretRegistrationData();

        //Ajax
        $.ajax({
                method: "GET",
                url: "/api/auth/users/" + credentials.username,
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
                
                // populate the profile screen
                if(data.length>0){
                        for(var i=0; i<data.length; i++){
                                document.getElementById("usernameRegister").value=data[i].username;
                                document.getElementById("email").value=data[i].email;
                                document.getElementById("firstName").value=data[i].firstname;
                                document.getElementById("lastName").value=data[i].lastname;
                                document.getElementById("birthday").value=data[i].birthday;
                                document.getElementById("pizza").value=data[i].pizza;
                                document.getElementById("soda").value=data[i].soda;
                        }
                } else console.log(JSON.stringify('No profile info'));;
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

// Change the data in the user's profile
function updateProfile(){
        interpretRegistrationData();

        var newPassword = registrationForm.newPassword;
        var newConfirm = registrationForm.passwordConfirm;

        // check if password is left blank -- password will not changed
        if ((!newPassword || newPassword == "" || newPassword == '')
        && (!newConfirm || newConfirm == "" || newConfirm == '')){
                newPassword = credentials.password;
                newConfirm = credentials.password;
        }

        //Ajax
        $.ajax({
                method: "PUT",
                url: "/api/auth/users/" + credentials.username,
                data: JSON.stringify({ 
                        "username":registrationForm.username, "password": newPassword, "confirmPassword": newConfirm, "email": registrationForm.email, 
                        "firstName": registrationForm.firstName, "lastName": registrationForm.lastName, "birthday": registrationForm.birthday,
                        "pizza": registrationForm.pizza, "soda": registrationForm.soda }),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                // Update the credentials and ensure the new information is properly displayed
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
                credentials.password = newPassword;
                getProfile();

        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
                
                // display error to user
                showErrors(err.responseJSON.error);
        });
}

// Deletes a profile
function deleteProfile(){
        $.ajax({
                method: "DELETE",
                url: "/api/auth/users/" + credentials.username,
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
                loginScreen();
                
                // clear HTML elements
                clearRegistrationFields();

                var credentials={ "username": "", "password":"" };

                var registrationForm={ 
                        "username": "", 
                        "password": "" ,
                        "passwordConfirm": "",
                        "email" : "",
                        "firstName": "",
                        "lastName": "",
                        "birthday": "",
                        "pizza": "",
                        "soda": ""
                };

                

        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

// Function that runs when the program starts
$(function(){

        $("#loginSubmit").on('click',function(){ login(); });
        $("#registerSubmit").on('click',function(){ register(); });
        $("#openRegistration").on('click',function(){ registrationScreen(); });
        $("#openLogin").on('click',function(){ loginScreen(); });
        $("#editProfile").on('click', function(){ updateProfile(); });
        $("#deleteProfile").on('click', function(){ deleteProfile(); });

        $("#profileNav").on('click',function(){ profileScreen(); });
        $("#logoutNav").on('click',function(){ loginScreen(); });
        
        loginScreen();
});

function showLogin(){$("#ui_login").show();}

function hideLogin(){$("#ui_login").hide();}

function clearRegistrationFields(){
        // clear HTML elements
        if (document.getElementById("#username"))document.getElementById("#username").value = "";
        if (document.getElementById("#password"))document.getElementById("#password").value = "";
        if (document.getElementById("#usernameRegister"))document.getElementById("#usernameRegister").value = "";
        if (document.getElementById("#newPassword"))document.getElementById("#newPassword").value = "";
        if (document.getElementById("#confirmPassword"))document.getElementById("#confirmPassword").value = "";
        if (document.getElementById("#email"))document.getElementById("#email").value = "";
        if (document.getElementById("#firstName"))document.getElementById("#firstName").value = "";
        if (document.getElementById("#lastName"))document.getElementById("#lastName").value = "";
        if (document.getElementById("#birthday"))document.getElementById("#birthday").value = "";
}

function showRegister(){
        clearRegistrationFields();
        password = document.getElementById('newPassword');
        password.placeholder = "Password";
        
        $("#ui_registration").show();
        document.getElementById('usernameRegister').disabled = false;
        $('#profileText').hide();
        $('#registerText').show();
        $("#editProfile").hide();
        $("#deleteProfile").hide();
        $("#registerSubmit").show();
        $("#openLogin").show();

}

function hideRegister(){$("#ui_registration").hide();}

function showProfile(){
        showRegister();
        getProfile();
        password = document.getElementById('newPassword');
        password.placeholder = "New Password";
        document.getElementById('usernameRegister').disabled = true;
        $("#registerSubmit").hide();
        $("#openLogin").hide();
        $('#profileText').show();
        $('#registerText').hide();
        $("#editProfile").show();
        $("#deleteProfile").show();
}

function hideProfile(){$("#ui_registration").hide();}
function showNavigation(){$("#ui_navbar").show();}
function hideNavigation(){$("#ui_navbar").hide();}

function showErrors(response){
        document.getElementById("ui_errors").innerText = response;
        $("#ui_errors").show();
}

function hideErrors(){
        document.getElementById("ui_errors").innerText="";
        $("#ui_errors").hide();
}

// The following methods display the different screens the user will interact with

function registrationScreen(){
        hideErrors();
        hideLogin();
        hideNavigation();
        showRegister();
}

function loginScreen(){

        document.getElementById("usernameRegister").value = "";
        hideErrors();

        showLogin();
        // hideNavigation();
        hideRegister();
}

function profileScreen(){
        hideLogin();
        showNavigation();
        hideRegister();
        showProfile();
}
