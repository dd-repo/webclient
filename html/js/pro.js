var pro_package,
    pro_packs = [],
	pro_balance = 0,
	pro_paymentmethod,
	pro_m,
	account_type_num,
	memberships = [],
	pro_usebalance=false;


function init_pro(key)
{
	if (key) {
		$('.main-pad-block').addClass('key');
	    sessionStorage.proref = 'accountcompletion';
	}
    
	if (u_type == 3)
	{
		api_req(
		{ a : 'uq',pro : 1},
		{ 
			callback : function (res) 
			{
				if (typeof res == 'object' && res.balance && res.balance[0]) pro_balance = res.balance[0][0];
			}
		});	
	}
	if (document.location.hash.indexOf('#pro/') > -1)
	{
		localStorage.affid = document.location.hash.replace('#pro/','');
		localStorage.affts = new Date().getTime();	
	}
	
	if (document.location.hash.indexOf('#pro#') > -1) sessionStorage.proref = document.location.hash.replace('#pro#','');
	
	
	$('body').addClass('pro');
	if (lang !== 'en') $('.reg-st3-save-txt').addClass(lang);
    if (lang == 'fr') $('.reg-st3-big-txt').each(function(e,o){$(o).html($(o).html().replace('GB','Go').replace('TB','To'));});
	
	
	if (!m)
	{
	   
	    api_req(
        { a : 'utqa'},
		    { 
			  callback : function (res) 
			  {
				  memberships = res;
				 
				  for ( var i = 0, l = memberships.length; i < l; i++ ) {
					  if (memberships[i][4] == 1) {
                        $('.reg-st3-membership-bl.pro' + memberships[i][1] + ' .price .num').html(memberships[i][5].split('.')[0]+'<span class="small">.'+memberships[i][5].split('.')[1]+' &euro;</span>');
					  }
				  }
			  }
	        }
	    );	
		
		if (lang !== 'en') $('.reg-st3-save-txt').addClass(lang);
	    if (lang == 'fr') $('.reg-st3-big-txt').each(function(e,o){$(o).html($(o).html().replace('GB','Go').replace('TB','To'));});
	     
	    $('.membership-step1 .reg-st3-membership-bl').unbind('click');
		$('.membership-step1 .reg-st3-membership-bl').bind('click',function(e)
		{		
			$('.reg-st3-membership-bl').removeClass('selected');
			$(this).addClass('selected');	
		});
		
		$('.membership-step1 .reg-st3-membership-bl').unbind('dblclick');
		$('.membership-step1 .reg-st3-membership-bl').bind('dblclick',function(e)
		{		
			$('.reg-st3-membership-bl').removeClass('selected');
			$(this).addClass('selected');
			pro_next_step($(this).attr('class').split(' ')[1]);	
		});
		
		$('.membership-free-button').unbind('click');
		$('.membership-free-button').bind('click',function(e) {
			if (page == 'fm') document.location.hash = '#start';
		    else document.location.hash = '#fm';
		    return false;
		});
		
		$('.membership-button').unbind('click');
		$('.membership-button').bind('click',function(e)
		{
			var $membershipBlock = $(this).closest('.reg-st3-membership-bl');
				
			$('.reg-st3-membership-bl').removeClass('selected');
			$membershipBlock.addClass('selected');
			
			account_type_num = $membershipBlock.attr('data-payment');
			$membershipBlock.clone().appendTo( '.membership-selected-block');
			$('.membership-step2 .pro span').html($membershipBlock.find('.reg-st3-bott-title.title').html())	;
			pro_next_step();
			
		});		
		
		$('.pro-bottom-button').unbind('click');
		$('.pro-bottom-button').bind('click',function(e)
		{
			document.location.hash = 'contact';
		});
	}
}

//Step2
function pro_next_step() {
	
	if(!u_handle) {
        megaAnalytics.log("pro", "loginreq");
        //msgDialog('loginrequired', 'title', 'msg');
        showSignupPromptDialog();
        return;
    } else if(isEphemeral()) {
        showRegisterDialog();
        return;
    }
	
	megaAnalytics.log("pro", "proc");
	
	var currentDate = new Date(),
	    monthName=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"),
	    mon = monthName[currentDate.getMonth()],
		day = currentDate.getDate(),
		pricePerMonth, pricePerYear;
		
	for (var i in memberships) {
		  if (memberships[i][1] == account_type_num ) {
			  if (memberships[i][4] == 1 ) pricePerMonth = memberships[i][5];
			  else pricePerYear = memberships[i][5];
		  }
	}
		
	$('.membership-step1').addClass('hidden');
	$('.membership-step2').removeClass('hidden');
	mainScroll();
	
	$('.membership-date .month').text(mon);
	$('.membership-date .day').text(day);
	
	$('.membership-dropdown-item').each(function() {
	   if($(this).attr('data-months')<12)
       $(this).find('strong').html(pricePerMonth * $(this).attr('data-months'));
	   else $(this).find('strong').html(pricePerYear);
    });
	
	$('.membership-st2-select span').unbind('click');
	$('.membership-st2-select span').bind('click',function()
	{		
		if ($('.membership-st2-select').attr('class').indexOf('active') == -1 ) $('.membership-st2-select').addClass('active');
		else $('.membership-st2-select').removeClass('active');
	});
	
	$('.membership-dropdown-item').unbind('click');
	$('.membership-dropdown-item').bind('click',function()
	{		
	    var price = $(this).find('strong').html();
	    $('.membership-dropdown-item').removeClass('selected');
		$(this).addClass('selected');
		$('.membership-st2-select').removeClass('active');
		$('.membership-st2-select span').html($(this).html());
		if (price) {
		   $('.membership-center.inactive').removeClass('inactive');
		   $('.membership-bott-price strong').html(price.split('.')[0]+'<span>.' + price.split('.')[1] + ' &euro;</span>');
		}
	});
	
	$('.membership-bott-button').unbind('click');
	$('.membership-bott-button').bind('click',function(e)
	{	
		if ($('.membership-center').attr('class').indexOf('inactive')==-1) {
			pro_continue(e);
            return false;
		}
	});
	
}

function pro_continue(e)
{
	if ($('.membership-dropdown-item.selected').attr('data-months')<12)
         pro_package = 'pro' + account_type_num + '_month';
		 //$('.membership-dropdown-item').attr('data-months') - how much months is selected
	else pro_package = 'pro' + account_type_num + '_year';
	
	pro_paymentmethod='';
	if (u_type === false)
	{
		u_storage = init_storage(localStorage);
		loadingDialog.show();
		u_checklogin({ checkloginresult: function(u_ctx,r) 
		{ 
			pro_pay();
		}},true);
	}
	else if (parseFloat(pro_balance) >= parseFloat(pro_packs[pro_package][5]))
	{
		msgDialog('confirmation',l[504],l[5844],false,function(e)
		{
			if(e) pro_paymentmethod = 'pro_prepaid';
			pro_pay();		
		});
	}
	else  pro_pay();	
}

function pro_pay()
{
	var aff=0;	
	if (localStorage.affid && localStorage.affts > new Date().getTime()-86400000) aff = localStorage.affid;

    if(!ul_uploading && !downloading) {
        redirectToPaypal();
    }

    api_req({ a : 'uts', it: 0, si: pro_packs[pro_package][0], p: pro_packs[pro_package][5], c: pro_packs[pro_package][6], aff: aff, 'm':m},
	{
		callback : function (res)
		{ 
			if (typeof res == 'number' && res < 0)
			{
				loadingDialog.hide();
				alert(l[200]);
			}
			else
			{
				if (pro_paymentmethod == 'pro_voucher' || pro_paymentmethod == 'pro_prepaid') pro_m = 0;
				else pro_m = 1;
				
				var proref = '';
				if (sessionStorage.proref) proref = sessionStorage.proref;

				api_req({ a : 'utc', s : [res], m : pro_m, r: proref },
				{ 
					callback : function (res)
					{
						if (pro_paymentmethod == 'pro_prepaid')
						{							
							loadingDialog.hide();
							if (typeof res == 'number' && res < 0)
							{
								if (res == EOVERQUOTA) alert(l[514]);
								else alert(l[200]);
							}
							else
							{
								if (M.account) M.account.lastupdate=0;
								document.location.hash = 'account';								
							}
						}
						else
						{					
							var ppurl = 'https://www.paypal.com/cgi-bin/webscr';
							if (res && res.EUR)
							{	
								var j = 0;
								for (var i in res.EUR)
								{
									if (j == 0) ppurl += '?';
									else ppurl += '&';
									ppurl += i + '=' + encodeURIComponent(res.EUR[i]);
									j++;
								}								
								loadingDialog.hide();
								redirectToPaypal(ppurl);                                
							}			
							else
							{
								loadingDialog.hide();
								alert(l[200]);
							}
						}
					}
				});
			}
		}
	});	
}

function showLoginDialog() {
    megaAnalytics.log("pro", "loginDialog");
    $.dialog = 'pro-login-dialog';

    var $dialog = $('.pro-login-dialog');
    $dialog
        .removeClass('hidden')
        .addClass('active');

    $('.fm-dialog-overlay').removeClass("hidden");

    $dialog.css({
        'margin-left': -1 * ($dialog.outerWidth()/2),
        'margin-top': -1 * ($dialog.outerHeight()/2)
    });

    $('.top-login-input-block').removeClass('incorrect');


    // controls
    $('.fm-dialog-close', $dialog)
        .unbind('click.proDialog')
        .bind('click.proDialog', function() {
            closeDialog();
        });

    $('.input-email', $dialog)
        .data('placeholder', l[195])
        .val(l[195]);

    $('.input-password', $dialog)
        .data('placeholder', l[909])
        .val(l[909]);

    uiPlaceholders($dialog);
    uiCheckboxes($dialog);


    $('#login-password, #login-name', $dialog).unbind('keydown');
    $('#login-password, #login-name', $dialog).bind('keydown',function(e)
    {
        $('.top-login-pad', $dialog).removeClass('both-incorrect-inputs');
        $('.top-login-input-tooltip.both-incorrect', $dialog).removeClass('active');
        $('.top-login-input-block.password', $dialog).removeClass('incorrect');
        $('.top-login-input-block.e-mail', $dialog).removeClass('incorrect');
        if (e.keyCode == 13) doProLogin($dialog);
    });


    $('.top-login-forgot-pass', $dialog).unbind('click');
    $('.top-login-forgot-pass', $dialog).bind('click',function(e)
    {
        document.location.hash = 'recovery';
    });

    $('.top-dialog-login-button', $dialog).unbind('click');
    $('.top-dialog-login-button', $dialog).bind('click',function(e) {
        doProLogin($dialog);
    });
};

var doProLogin = function($dialog) {
    megaAnalytics.log("pro", "doLogin");

    loadingDialog.show();
    var ctx =
    {
        checkloginresult: function(ctx,r)
        {
            loadingDialog.hide();

            if (r == EBLOCKED)
            {
                alert(l[730]);
            }
            else if (r)
            {
                $('#login-password', $dialog).val('');
                $('#login-email', $dialog).val('');
                u_type = r;
                init_page();
                if(pro_package) {
                    var cls = pro_package
                        .replace("_month", "")
                        .replace("_year", "");

                    $('.reg-st3-membership-bl').removeClass('selected')
                    $('.reg-st3-membership-bl.' + cls).addClass('selected');
                }
                pro_continue();
            }
            else
            {
                $('#login-password', $dialog).val('');
                alert(l[201]);
            }
        }
    };


    var passwordaes = new sjcl.cipher.aes(prepare_key_pw($('#login-password', $dialog).val()));
    var uh = stringhash($('#login-name', $dialog).val().toLowerCase(),passwordaes);
    u_login(
        ctx,
        $('#login-name', $dialog).val(),
        $('#login-password', $dialog).val(),
        uh,
        $('#login-checkbox').is('.checkboxOn')
    );
};

function showRegisterDialog() {
    megaAnalytics.log("pro", "regDialog");
    $.dialog = 'pro-register-dialog';

    var $dialog = $('.pro-register-dialog');
    $dialog
        .removeClass('hidden')
        .addClass('active');

    $('.fm-dialog-overlay').removeClass("hidden");

    var reposition = function() {
        $dialog.css({
            'margin-left': -1 * ($dialog.outerWidth() / 2),
            'margin-top': -1 * ($dialog.outerHeight() / 2)
        });
    };

    reposition();

    $('*', $dialog).removeClass('incorrect'); // <- how bad idea is that "*" there?


    // controls
    $('.fm-dialog-close', $dialog)
        .unbind('click.proDialog')
        .bind('click.proDialog', function() {
            closeDialog();
        });

    $('#register-email', $dialog)
        .data('placeholder', l[95])
        .val(l[95]);

    $('#register-firstname', $dialog)
        .data('placeholder', l[1096])
        .val(l[1096]);

    $('#register-lastname', $dialog)
        .data('placeholder', l[1097])
        .val(l[1097]);

    $('#register-password', $dialog)
        .addClass('input-password')
        .data('placeholder', l[909])
        .val(l[909]);

    $('#register-password2', $dialog)
        .addClass('input-password')
        .data('placeholder', l[1114])
        .val(l[1114]);

    uiPlaceholders($dialog);
    uiCheckboxes($dialog);

    var registerpwcheck = function()
    {
        $('.login-register-input.password', $dialog).removeClass('weak-password strong-password');
        $('.new-registration', $dialog).removeClass('good1 good2 good3 good4 good5');
        if (typeof zxcvbn == 'undefined' || $('#register-password', $dialog).attr('type') == 'text' || $('#register-password', $dialog).val() == '') return false;
        var pw = zxcvbn($('#register-password', $dialog).val());
        if (pw.score > 3 && pw.entropy > 75)
        {
            $('.login-register-input.password', $dialog).addClass('strong-password');
            $('.new-registration', $dialog).addClass('good5');
            $('.new-reg-status-pad', $dialog).html('<strong>' + l[1105] + '</strong>' + l[1128]);
            $('.new-reg-status-description', $dialog).text(l[1123]);
        }
        else if (pw.score > 2 && pw.entropy > 50)
        {
            $('.login-register-input.password', $dialog).addClass('strong-password');
            $('.new-registration', $dialog).addClass('good4');
            $('.new-reg-status-pad', $dialog).html('<strong>' + l[1105] + '</strong>' + l[1127]);
            $('.new-reg-status-description', $dialog).text(l[1122]);
        }
        else if (pw.score > 1 && pw.entropy > 40)
        {
            $('.login-register-input.password', $dialog).addClass('strong-password');
            $('.new-registration', $dialog).addClass('good3');
            $('.new-reg-status-pad', $dialog).html('<strong>' + l[1105] + '</strong>' + l[1126]);
            $('.new-reg-status-description', $dialog).text(l[1121]);
        }
        else if (pw.score > 0 && pw.entropy > 15)
        {
            $('.new-registration', $dialog).addClass('good2');
            $('.new-reg-status-pad', $dialog).html('<strong>' + l[1105] + '</strong>' + l[1125]);
            $('.new-reg-status-description', $dialog).text(l[1120]);
        }
        else
        {
            $('.login-register-input.password', $dialog).addClass('weak-password');
            $('.new-registration', $dialog).addClass('good1');
            $('.new-reg-status-pad', $dialog).html('<strong>' + l[1105] + '</strong> ' + l[1124]);
            $('.new-reg-status-description', $dialog).text(l[1119]);
        }
        $('.password-status-warning', $dialog).html('<span class="password-warning-txt">' + l[34] + '</span> ' + l[1129] + '<div class="password-tooltip-arrow"></div>');
        $('.password-status-warning', $dialog).css('margin-left',($('.password-status-warning', $dialog).width()/2*-1)-13);
        reposition();
    };

    if (typeof zxcvbn == 'undefined' && !silent_loading)
    {
        $('.login-register-input.password', $dialog).addClass('loading');
        silent_loading=function()
        {
            $('.login-register-input.password', $dialog).removeClass('loading');
            registerpwcheck();
        };
        jsl.push(jsl2['zxcvbn_js']);
        jsl_start();
    }
    $('#register-password', $dialog).unbind('keyup.proRegister');
    $('#register-password', $dialog).bind('keyup.proRegister',function(e)
    {
        registerpwcheck();
    });
    $('.password-status-icon', $dialog).unbind('mouseover.proRegister');
    $('.password-status-icon', $dialog).bind('mouseover.proRegister',function(e)
    {
        if ($(this).parents('.strong-password').length == 0)
        {
            $('.password-status-warning', $dialog).removeClass('hidden');
        }

    });
    $('.password-status-icon', $dialog).unbind('mouseout.proRegister');
    $('.password-status-icon', $dialog).bind('mouseout.proRegister',function(e)
    {
        if ($(this).parents('.strong-password').length == 0)
        {
            $('.password-status-warning', $dialog).addClass('hidden');
        }
    });

    $('input', $dialog).unbind('keydown.proRegister');
    $('input', $dialog).bind('keydown.proRegister',function(e)  {
        if (e.keyCode == 13) {
            doProRegister($dialog);
        }
    });


    $('.register-st2-button', $dialog).unbind('click');
    $('.register-st2-button', $dialog).bind('click',function(e) {
        doProRegister($dialog);
        return false;
    });

    $('.new-registration-checkbox a', $dialog)
        .unbind('click.proRegisterDialog')
        .bind('click.proRegisterDialog',function(e) {
            $.termsAgree = function()
            {
                $('.register-check').removeClass('checkboxOff');
                $('.register-check').addClass('checkboxOn');
            };
            termsDialog();
            return false;
        });
};

var doProRegister = function($dialog) {
    megaAnalytics.log("pro", "doRegister");
    loadingDialog.show();

    if (u_type > 0)
    {
        msgDialog('warninga',l[135],l[5843]);
        loadingDialog.show();
        return false;
    }


    var registeraccount = function()
    {
        var ctx =
        {
            callback : function(res)
            {
                loadingDialog.hide();
                if (res == 0)
                {
                    var ops = {a:'up'};

                    ops.terms = 'Mq';
                    ops.firstname = base64urlencode(to8($('#register-firstname', $dialog).val()));
                    ops.lastname = base64urlencode(to8($('#register-lastname', $dialog).val()));
                    ops.name2 = base64urlencode(to8($('#register-firstname', $dialog) + ' ' + $('#register-lastname', $dialog).val()));
                    u_attr.terms=1;

                    api_req(ops);

                    proceedToPaypal();
                }
                else
                {
                    if (res == EACCESS) alert(l[218]);
                    else if (res == EEXIST)
                    {
                        if (m) alert(l[219]);
                        else
                        {
                            $('.login-register-input.email .top-loginp-tooltip-txt', $dialog).html(l[1297] + '<div class="white-txt">' + l[1298] + '</div>');
                            $('.login-register-input.email', $dialog).addClass('incorrect');
                            msgDialog('warninga','Error',l[219]);

                            loadingDialog.hide();
                        }
                    }
                }
            }
        };

        var rv={};

        rv.name = $('#register-firstname', $dialog).val() + ' ' + $('#register-lastname', $dialog).val();
        rv.email = $('#register-email', $dialog).val();
        rv.password = $('#register-password', $dialog).val();

        var sendsignuplink = function(name,email,password,ctx)
        {
            var pw_aes = new sjcl.cipher.aes(prepare_key_pw(password));
            var req = { a : 'uc', c : base64urlencode(a32_to_str(encrypt_key(pw_aes,u_k))+a32_to_str(encrypt_key(pw_aes,[rand(0x100000000),0,0,rand(0x100000000)]))), n : base64urlencode(to8(name)), m : base64urlencode(email) };

            api_req(req,ctx);
        };

        sendsignuplink(rv.name,rv.email,rv.password,ctx);
    };



    var err=false;

    if ($('#register-firstname', $dialog).val() == '' || $('#register-firstname', $dialog).val() == l[1096] || $('#register-lastname', $dialog).val() == '' || $('#register-lastname', $dialog).val() == l[1097])
    {
        $('.login-register-input.name', $dialog).addClass('incorrect');
        err=1;
    }
    if ($('#register-email', $dialog).val() == '' || $('#register-email', $dialog).val() == l[1096] || checkMail($('#register-email', $dialog).val()))
    {
        $('.login-register-input.email', $dialog).addClass('incorrect');
        err=1;
    }

    if ($('#register-email', $dialog).val() == '' || $('#register-email', $dialog).val() == l[1096] || checkMail($('#register-email', $dialog).val()))
    {
        $('.login-register-input.email', $dialog).addClass('incorrect');
        err=1;
    }

    var pw = zxcvbn($('#register-password', $dialog).val());
    if ($('#register-password', $dialog).attr('type') == 'text')
    {
        $('.login-register-input.password.first', $dialog).addClass('incorrect');
        $('.white-txt.password', $dialog).text(l[213]);
        err=1;
    }
    else if (pw.score == 0 || pw.entropy < 16)
    {
        $('.login-register-input.password.first', $dialog).addClass('incorrect');
        $('.white-txt.password', $dialog).text(l[1104]);
        err=1;
    }

    if ($('#register-password', $dialog).val() !== $('#register-password2', $dialog).val())
    {
        $('#register-password', $dialog)[0].type = 'password';
        $('#register-password2', $dialog)[0].type = 'password';
        $('#register-password', $dialog).val('');
        $('#register-password2', $dialog).val('');
        $('.login-register-input.password.confirm', $dialog).addClass('incorrect');
        err=1;
    }

    if (!err && typeof zxcvbn == 'undefined')
    {
        msgDialog('warninga',l[135],l[1115] + '<br>' + l[1116]);
        loadingDialog.hide();
        return false;
    }
    else if (!err)
    {
        if ($('.register-check', $dialog).attr('class').indexOf('checkboxOff') > -1)
        {
            msgDialog('warninga',l[1117],l[1118]);
            loadingDialog.hide();
        }
        else
        {
            if (localStorage.signupcode)
            {
                loadingDialog.show();
                u_storage = init_storage(localStorage);
                var ctx =
                {
                    checkloginresult: function(u_ctx,r)
                    {
                        if (typeof r[0] == 'number' && r[0] < 0) msgDialog('warningb',l[135],l[200]);
                        else
                        {
                            loadingDialog.hide();
                            u_type = r;
                            document.location.hash = 'fm'; //TODO: fixme
                        }
                    }
                }
                var passwordaes = new sjcl.cipher.aes(prepare_key_pw($('#register-password', $dialog).val()));
                var uh = stringhash($('#register-email', $dialog).val().toLowerCase(),passwordaes);
                u_checklogin(ctx,true,prepare_key_pw($('#register-password', $dialog).val()),localStorage.signupcode,$('#register-firstname', $dialog).val() + ' ' + $('#register-lastname', $dialog).val(),uh);
                delete localStorage.signupcode;
            }
            else if (u_type === false)
            {
                loadingDialog.show();
                u_storage = init_storage(localStorage);
                u_checklogin(
                    {
                        checkloginresult: function(u_ctx,r)
                        {
                            u_type = r;
                            registeraccount();
                        }
                    },true);
            }
            else if (u_type == 0) registeraccount();
        }
    }
    if(err) {
        loadingDialog.hide();
    }
};

var paypalTimeout = null;
function redirectToPaypal(url) {
    
    // Temporarily redirect to #resellers page because PayPal aren't taking payments anymore
    window.location.replace("#resellers");
    return false;
    
    clearTimeout(paypalTimeout);

    $('.pro-register-dialog')
        .removeClass('active')
        .addClass('hidden');

    $('.fm-dialog-overlay').removeClass('hidden');

    var $dialog = $('.fm-dialog.pro-register-paypal-dialog');

    var reposition = function() {
        $dialog.css({
            'margin-left': -1 * ($dialog.outerWidth() / 2),
            'margin-top': -1 * ($dialog.outerHeight() / 2)
        });
    };
    reposition();


    var fadeOutInLoop = function($elm) {
        $elm
            .animate({
                'opacity': 0.2
            }, 600)
            .animate({'opacity': 1}, 1000, function() {
                fadeOutInLoop($elm);
            });
    };

    fadeOutInLoop($('.pro-register-paypal-dialog .reg-success-icon'));

    $dialog
        .addClass('active')
        .removeClass('hidden');




    if(url) {
        megaAnalytics.log("pro", "proceedingToPaypal");

        paypalTimeout = setTimeout(function () {
            document.location = url;
        }, 3000);
    }

}
function redirectToPaypalHide() {
    $('.fm-dialog.pro-register-paypal-dialog')
        .removeClass('active')
        .addClass('hidden');

    $('.fm-dialog-overlay').addClass('hidden');
}

var proceedToPaypal = function() {

    if(pro_package) {
        var cls = pro_package
            .replace("_month", "")
            .replace("_year", "");

        $('.reg-st3-membership-bl').removeClass('selected')
        $('.reg-st3-membership-bl.' + cls).addClass('selected');

        u_type=1;
    }

    pro_continue();
};


var signupPromptDialog = null;
var showSignupPromptDialog = function() {
    if(!signupPromptDialog) {
        signupPromptDialog = new mega.ui.Dialog({
            'className': 'loginrequired-dialog',
            'closable': true,
            'focusable': false,
            'expandable': false,
            'requiresOverlay': true,
            'title': l[5841],
            'buttons': []
        });
        signupPromptDialog.bind('onBeforeShow', function() {
            $('.fm-dialog-title',this.$dialog)
                .text(
                    this.options.title
                );

            // custom buttons, because of the styling
            $('.fm-notification-info',this.$dialog)
                .html('<p>' + l[5842] + '</p>');

            $('.fm-dialog-button.pro-login', this.$dialog)
                .unbind('click.loginrequired')
                .bind('click.loginrequired', function() {
                    signupPromptDialog.hide();
                    showLoginDialog();
                    return false;
                });

            $('.fm-dialog-button.pro-register', this.$dialog)
                .unbind('click.loginrequired')
                .bind('click.loginrequired', function() {
                    signupPromptDialog.hide();
                    showRegisterDialog();
                    return false;
                });
        });
    }

    signupPromptDialog.show();

    var $selectedPlan = $('.reg-st3-membership-bl.selected');
    var plan = 1;
    if($selectedPlan.is(".lite")) { plan = 1; }
	else if($selectedPlan.is(".pro1")) { plan = 2; }
    else if($selectedPlan.is(".pro2")) { plan = 3; }
    else if($selectedPlan.is(".pro3")) { plan = 4; }

    $('.loginrequired-dialog .fm-notification-icon')
        .removeClass('plan1')
        .removeClass('plan2')
        .removeClass('plan3')
		.removeClass('plan4')
        .addClass('plan' + plan);
}