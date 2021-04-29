export default function validateLogin(username, password){
	var errors="";

	// username: letters,numbers, _
	if(username!=""){
		var u = /^\w+$/.exec(username);
		if(!u)errors+='Username must contain only characters from a-Z, 0-9, _\n';
	}else errors+='Username is required\n';
	
	// password: letters, numbers, _, special characters: ~,!,@,#,$,%,^,&,*,comma, period
	if(password!=""){
		var p = /^[\w\~\!\@\#\$\%\^\&\*\,\.]+$/.exec(password);
		if(!p)errors+='Password must contain only characters from a-Z, 0-9, .,~!@#$%^&*-_\n';
	} else errors+='Password is required\n';

	return errors;
}

export default function validateProfile(username, password, confirmPassword, email, firstName, lastName, birthday, pizza, soda){
	// username and password
	var errors=validateLogin(username, password);

	// confirmPassword -- re-check if password is valid for making comparison
	var p = /^[\w\~\!\@\#\$\%\^\&\*\,\.]+$/.exec(password);
	if(password!="" && p!=null){
		if(confirmPassword=="")errors+=' Re-enter your password\n';
		else if(password!=confirmPassword)errors+=' Passwords do not match\n';
	}

	// email
	if(email!=""){
		var e = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.exec(email);
		if(!e)errors+="Email must be of the form johnsmith@mail.com\n";
	} else errors+=" Email is required\n";

	// firstName
	if(firstName!=""){
		var fn = /^[a-zA-Z]+$/.exec(firstName);
		if(!fn)errors+='First name must contain only letters\n';
	} else errors+=' First name is required\n';

	// lastName
	if(lastName!=""){
		var ln = /^[a-zA-Z]+$/.exec(lastName);
		if(!ln)errors+='Last name must contain only letters\n';
	} else errors+=' Last name is required\n';

	// birthday
	if(birthday!=""){
		var b = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.exec(birthday);
		if(!b)errors+='Birthday must be in the form of YYYY-MM-DD\n';
	} else errors+=" Birthday is required\n";
	
	// pizza
	if(pizza!='yes' && pizza!='no' || pizza==""){
		errors+=' Please specify if you like pineapple on pizza\n';
	}

	// soda
	if(!['Water', 'Pepsi Cola','Coca Cola', '7UP', 'Sprite', 'Fanta', "President's Choice"].includes(soda) || soda===""){
		errors+=' Please choose one of the listed sodas\n';
	}
	return errors;
}