jQuery(document).ready(function($) {

    /*======= Skillset *=======*/
    
    
    $('.level-bar-inner').css('width', '0');
    
    $(window).on('load', function() {

        $('.level-bar-inner').each(function() {
        
            var itemWidth = $(this).data('level');
            
            $(this).animate({
                width: itemWidth
            }, 800);
            
        });

    });

    /*============================*/

    wrapper = document.getElementsByClassName('wrapper');
    $(wrapper).css("background-color", "inherit");
    $(wrapper).addClass('new_wrapper').removeClass('wrapper');
    var textarea = document.getElementById('text_area_coment');
    $(textarea).focus();   
    var email = document.getElementById('email');
    $(email).focus(); 
    var username = document.getElementById('username');
    $(username).focus();  
    var send_coment = document.getElementById('send_coment'); 
    var notification_container = document.getElementById('messageNotification');
    var notification = document.getElementById('notification'); 

    $(function(){               
        $(send_coment).click(function(e){
            e.preventDefault();
            var id = $(this).attr('m_id');
            var val = $(textarea).val();
            if(val.length === 0 || val === ' ') 
                return;
            $(textarea).attr('disabled', 'disabled');
            $(send_coment).attr('disabled', 'disabled');
            var data = {};
            data.id = id;
            data.message = val;

            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: 'http://localhost:8080/message/to/' + id,  
                success: function(data) {
                    $(textarea).val('');
                    $(textarea).prop("disabled", false); 
                    $(send_coment).prop("disabled", false); 
                    $(textarea).focus();   
                },

                complete: function(data) {
                  //called when complete
                  if(data.readyState === 4) {
                      // console.log(data.responseJSON.username);
                      // console.log(data);

                        var message = '<hr /><section class="section summary-section" style="direction: rtl">';
                        message += '<div class="detail">';
                        message += '<span class="date" style="float: left;font-weight: bold">زمان : ';
                        message += data.responseJSON.time + '</span>';
                        message += '<span class="user" style="font-size: 16px;font-weight: bold">';
                        message += data.responseJSON.username + ' :</span>';
                        message += '</div>';

                        message += '<div class="comment"> ';
                        message += data.responseJSON.message;
                        message += '</div>';
                        message += '</section><!--//section--> ';

                        var obj = document.getElementById('comment_container');
                        $(obj).append(message);

                        var m_data = {
                            id: data.responseJSON.session_id,
                            message: data.responseJSON.message, 
                            username: data.responseJSON.username,
                            time: data.responseJSON.time, 
                            contact_id: data.responseJSON.contact_id,
                            unread_message: data.responseJSON.unread_message,
                            unread_message_detailed: data.responseJSON.unread_message_detailed,
                        };

                        socket.emit('channel:message:send', {data: m_data});
                        socket.emit('channel:message:send:update', {data: m_data});
                  }
                },

                error: function() {
                  console.log('process error');
                }
            });
        });             
    });

});