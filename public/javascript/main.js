const socket = io();
const game_interface = {
//stan okna menu 
    menu_form_is_login : true,
    menu_login_form : `
        <fieldset>
            <legend>Zaloguj się</legend>
                <label for="login">login</label><input type="text" id="login" require="true"><p class="error"></p>
                <label for="password">hasło</label><input type="password" id="password" require="true"><p class="error"></p>
                <label for="renember"  class="cbLabel">Zapamiętaj<input type="checkbox" id="renember"  value=""><span class="cb"></span></label><p class="error"></p>
                <input type="submit" value="Zaloguj" id="send">
                <input type="button" value="Rejestracja" id ="change">
        </fieldset>`,
    menu_regisrer_form :`
        <fieldset>
            <legend>Zarejestruj się</legend>
                <label for="login">login</label><input type="text" id="login" require="true" pattern="^[0-9a-zA-Z_.-]+$" pattern_err="Może zawierać litery, cyfry i znaki _-."  max="25" min="3"><p class="error"></p>
                <label for="email">e-mail</label><input type="email" id="email" require="true" pattern="^[0-9a-zA-Z_.-]+@[0-9a-zA-Z.-]+\.[a-zA-Z]{2,3}$" pattern_err="Niepoprawny adres e-mail"><p class="error"></p>
                <label for="password">hasło</label><input type="password" id="password" require="true" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{1,255}$" pattern_err="Musi zawierać cyfrę i wielką literę" max="255" min="8"><p class="error"></p>
                <label for="regulations"  class="cbLabel">Zapamiętaj<input type="checkbox" id="regulations"  value="" require="true"><span class="cb"></span></label><p class="error"></p>
                <input type="submit" value="Zarejestruj" id="send">
                <input type="button" value="Wróc" id="change">
        </fieldset>`,
//=======================================================  Funkcje  ==================================================
// przygotowanie danych do wysyłki
    check_to_send(){
        let inputs = document.querySelector('#menu_form').querySelectorAll('input[type=text], input[type=password], input[type=email], input[type=checkbox]');
        inputs.forEach((input)=>{
                if(input.type==='checkbox' && input.getAttribute('require') && input.checked === false){
                    console.log(1)
                    input.parentElement.nextElementSibling.innerHTML = 'Wymaga zaznaczenia';
                    input.nextElementSibling.classList.add('is_error');
                }else if(input.type !=='checkbox' && input.getAttribute('require') && input.value === ''){
                    console.log(2)
                    this.error_text(input, `Uzupełnij`, true);
                }else{
                    console.log(3)
                }
            });
            if(document.querySelector('#menu_form').querySelector('.is_error') !== null) {
                console.log('errorki')
                document.querySelector('#send').setAttribute('disabled', '');
            }else{
                let data = `{`; 
                inputs.forEach((input)=>{
                    (input.type==='checkbox') ? data += `"${input.id}" : ${input.checked},` : data += `"${input.id}" : "${input.value}",`;
                })
                data = data.slice(0,data.length-1) + `}`;
                console.log(data);
                socket.emit(!this.menu_form_is_login ? 'login' : 'register', JSON.parse(data));
            }  
    },
//funkcja startowa dla menu_form. zmiana stanu i zawartości okienka menu form
    change_menu_form_content() {
        let form = document.querySelector('#menu_form');
        form.innerHTML = this.menu_form_is_login ? this.menu_login_form : this.menu_regisrer_form;
        form.querySelector('#change').addEventListener("click", ()=>{
            this.change_menu_form_content();
        });
        form.querySelector('#send').addEventListener("click", (e)=>{
            e.preventDefault()
            this.check_to_send()
            console.log('funkcja sprawdzająca, czy wszystko jest ok przed wysyłką');
        });
        
        form.querySelectorAll('input[type=text], input[type=password], input[type=email]')
            .forEach((input)=>{
                input.addEventListener('keyup', ()=>{this.validation_menu_input(input)})
                input.addEventListener('change', ()=>{this.validation_menu_input(input)})
            });

        form.querySelectorAll('input[type=checkbox]')
            .forEach((input)=>{
                input.addEventListener('click', ()=>{this.validation_menu_input(input)})
            });
        this.menu_form_is_login = !this.menu_form_is_login;
    },
//odwalanie walidacji pól formularza xD
    validation_menu_input(input){
        let reg =  (input.getAttribute('pattern') !== null) ? new RegExp(input.getAttribute('pattern')) : null;
        if(input.type==='checkbox' && input.getAttribute('require') && input.checked === false){ 
            input.parentElement.nextElementSibling.innerHTML = 'Wymaga zaznaczenia';
            input.nextElementSibling.classList.add('is_error');
        }else if(input.type==='checkbox' && input.checked === true){ 
            input.parentElement.nextElementSibling.innerHTML = '';
            input.nextElementSibling.classList.remove('is_error');
        }else if(input.getAttribute('min') !== null && input.getAttribute('min') > input.value.length){
            this.error_text(input, `min. ${input.getAttribute('min')} znaki`, true);
        }else if(input.getAttribute('max') !== null && input.getAttribute('max') < input.value.length){
            this.error_text(input, `max. ${input.getAttribute('max')} znaki`, true);
        }else if(reg !== null && !reg.test(input.value)){
            this.error_text(input,  input.getAttribute('pattern_err'), true);
        }else{
            this.error_text(input,  null, false);
        }
        
        if(document.querySelector('#menu_form').querySelector('.is_error') !== null) {
            document.querySelector('#send').setAttribute('disabled', '');
        }else{
            document.querySelector('#send').removeAttribute('disabled') ;
        }        
    },
//funkcja pomocnicza obsługująca błędy
    error_text(input, text, is_err){
        input.nextElementSibling.innerHTML = text;
        is_err ? input.classList.add('is_error') : input.classList.remove('is_error');
    }
}
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! załaduj po wczytaniu dokumentu !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
document.addEventListener("DOMContentLoaded", () => {
     
    game_interface.change_menu_form_content();
});