document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('form').onsubmit = function(){
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value ;
    const body = document.querySelector('#compose-body').value ;
    fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
  };
  // By default, load the inbox
  load_mailbox('inbox');



  
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  displayAllemails(mailbox);

}
function displayAllemails(mailbox){
  const page = document.querySelector('#emails-view');
  page.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
    for(let email of emails){
      
      color = `gray`;
      if(email.read){
        color = `white`;
      }
      page.innerHTML +=  `<div class="emails" id="${email.id}" style="cursor: pointer;border: 2px solid black; background-color: ${color}; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <b>${email.sender}</b> &nbsp; ${email.subject}
        </div>
        <span>${email.timestamp}</span>
      </div>`;
    }
    document.querySelectorAll('.emails').forEach((email)=>{
      email.addEventListener('click',()=>{
        const id = email.id;
        read_statu(id);
        displayInfo(id,mailbox)
      });
    });

    

  });
}
function displayInfo(mail_id,mailbox){
  fetch(`/emails/${mail_id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
    console.log(email);
    const page = document.querySelector('#emails-view');
    let reply = ``;
    let archive = ``;
    if(mailbox === 'inbox'){
      archive = `<button id="archive">archive</button>`;
    }
    if(mailbox === 'archive'){
      archive = `<button id="archive">unarchive</button>`;
    }
    if(mailbox === 'inbox' || mailbox === 'archive'){
      reply = `<button id="reply">reply</button>`;
    }
    page.innerHTML = `
      <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
      <p><b>From : </b>${email.sender}</p>
      <p><b>To : </b>${email.recipients}</p>
      <p><b>Subject : </b>${email.subject}</p>
      <p><b>Timestamp : </b>${email.timestamp}</p>
      ${reply}
      ${archive}
      <hr>
      <p>${email.body}</p>
    `;
    const replyButton = document.querySelector('#reply');
      if (replyButton) {
        replyButton.addEventListener('click', () => {
          compose_email();
          document.querySelector('#compose-recipients').value = email.sender;
          document.querySelector('#compose-subject').value = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;
          document.querySelector('#compose-body').value = `\n\nOn ${email.timestamp}, ${email.sender} wrote:\n${email.body}`;
        });
      }
    
    
    if(mailbox === 'inbox' || mailbox === 'archive'){
      document.querySelector('#archive').addEventListener('click',async function(){
        await archive_status(mail_id,!email.archived);
        load_mailbox(mailbox);
      })
      
    }

  });
}

function archive_status(mail_id,statu){
  return fetch(`/emails/${mail_id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: statu
  })
})
}
function read_statu(mail_id){
  fetch(`/emails/${mail_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
  })
  })
}