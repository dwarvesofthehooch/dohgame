//import * as io from 'socket.io-client'
const game_interface = {
//stany stratowe obiektów interfejsu
    menu_form_is_login : true,
//konfiguracja walidacji pól formularzy logowania i rejestracji
    menu_form_validation_config : {
        login : {min_length : 3, max_length : 25, pattern : "^[0-9a-zA-Z_.-]+$"},
        email : {/*min_length : 8, max_length : 255,*/ pattern : "^[0-9a-zA-Z_.-]+@[0-9a-zA-Z.-]+\.[a-zA-Z]{2,3}$"},
        password : {min_length : 8, max_length : 255, pattern : "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{1,255}$"} //(?=.*[ -/:-@\[-`{-~]) dodaje znaki specjalne wstawić przed .{1,255}
    },
//elementy interfejsu
    menu_form : document.querySelector('#menu_form'),
    menu_form_login : {
       content : `<fieldset>
        <legend>Login:</legend>
        <label for="login">login:</label>
        <input type="text" id="login" name="login"/>
        <label for="password">password:</label>
        <input type="password" id="password" name="password"/>
        <label for="renember"  class="cbLabel">Zapamiętaj: &nbsp<input type="checkbox" id="renember" name="renember" value=""><span class="cb"></span></label>
        <input type="submit" value="Login" id="login_button"/>
        <input type="button" value="Register" id="change_menu_form"/>
        </fieldset>`
    },
    menu_form_register : {
        content : `<fieldset>
        <legend>rejestracja</legend>
        <label for="login">login:</label>
        <input type="text" id="login" name="login">
        <p class="error"></p>
        <label for="email">E-mail:</label>
        <input type="email" id="email" name="email">
        <p class="error"></p>
        <label for="password">password:</label>
        <input type="password" id="password" name="password">
        <p class="error"></p>
        <label for="accept_reg"  class="cbLabel">ackeptuję <input type="button" value="regulamin" id="regulamin"><input type="checkbox" id="accept_reg" name="accept_reg" value=""><span class="cb"></span></label>
        <input type="submit" value="Register" id="register" disabled>
        <p class="error"></p>
        <input type="button" value="Return" id="change_menu_form">
      </fieldset>`
    },
//funkcja zmieniająca okno logowania na okno rejestracji
    change_menu_form_content : () => {
        game_interface.menu_form.innerHTML = game_interface.menu_form_is_login ? game_interface.menu_form_login.content : game_interface.menu_form_register.content;
        document.querySelector('#change_menu_form').addEventListener("click", ()=>{
            game_interface.change_menu_form_content();
        });
        (game_interface.menu_form_is_login) ? game_interface.check_menu_form_login() : game_interface.actions_menu_form_register();
        game_interface.menu_form_is_login = !game_interface.menu_form_is_login;
        
    },
//funkcja obsługująca okienko logowania
    check_menu_form_login : () => {
        document.querySelector('#login_button').addEventListener('click', (e) => {
            e.preventDefault()
            login_user();
        })
    },
//funkcja walidująca pola 
    check_menu_input_validation :(input) => {
        let value = document.querySelector(`#${input}`).value;
        let reg =  (game_interface.menu_form_validation_config[input].pattern !== undefined) ? new RegExp(game_interface.menu_form_validation_config[input].pattern) : undefined;           
        document.querySelector(`#register`).nextElementSibling.innerHTML = ``;
        document.querySelector(`#register`).nextElementSibling.classList.remove('error_require');       
            if(game_interface.menu_form_validation_config[input].min_length !== undefined && game_interface.menu_form_validation_config[input].min_length > value.length){
                document.querySelector(`#${input}`).nextElementSibling.innerHTML = `min. ${game_interface.menu_form_validation_config[input].min_length} znaki`;
                document.querySelector(`#${input}`).nextElementSibling.classList.add('is_error');
            }
            else if(game_interface.menu_form_validation_config[input].max_length !== undefined && game_interface.menu_form_validation_config[input].max_length < value.length) {
                document.querySelector(`#${input}`).nextElementSibling.innerHTML = `max. ${game_interface.menu_form_validation_config[input].max_length} znaki`;
                document.querySelector(`#${input}`).nextElementSibling.classList.add('is_error');
            }
            else if(reg !== undefined && !reg.test(value)){
                document.querySelector(`#${input}`).nextElementSibling.innerHTML = `błąd pattern`;
                document.querySelector(`#${input}`).nextElementSibling.classList.add('is_error');
            }
            else{
                document.querySelector(`#${input}`).nextElementSibling.innerHTML = null;
                document.querySelector(`#${input}`).nextElementSibling.classList.remove('is_error');               
            }
            if(game_interface.menu_form.querySelector('.is_error') !== null) {
                game_interface.menu_form.querySelector('#register').setAttribute('disabled', '')
            }else{
                game_interface.menu_form.querySelector('#register').removeAttribute('disabled') ;
            } 
   },
//funkcja obsługująca okienko rejestracji
//dodaje walidację do pól tekstowych z funkcji game_interface.check_menu_input_validation
//dodaje walidację do pól tekstowych z funkcji game_interface.chech_menu_checkbox
//ustala, czy można wysłać formularz rejestracji
    actions_menu_form_register : () => {
        for(let input in game_interface.menu_form_validation_config ){
            let element = document.querySelector(`#${input}`)
            element.addEventListener('keyup', ()=>{game_interface.check_menu_input_validation(input);}, false);
            element.addEventListener('change', ()=>{game_interface.check_menu_input_validation(input);}, false);
        }
        document.querySelector(`#register`).addEventListener('click', (e)=>{
            e.preventDefault();
            let inputs = game_interface.menu_form.querySelectorAll('input[type=text], input[type=password], input[type=email]')
            for(let input in inputs){
                if(inputs[input].value ===undefined) break;
                if(inputs[input].value === ''){
                    document.querySelector(`#register`).nextElementSibling.innerHTML = `uzupełnij wszystko`;
                    document.querySelector(`#register`).nextElementSibling.classList.add('error_require');
                }else{                   
                    document.querySelector(`#register`).nextElementSibling.innerHTML = ``;
                    document.querySelector(`#register`).nextElementSibling.classList.remove('error_require');
                }
            }
            if(document.querySelector(`.error_require`) === null){
                console.log('dane są do wysłania')
            }else{
                console.log('nie można wysłać danych')
            }
        });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    game_interface.change_menu_form_content();
 });
//socket spam, kontrola czy w ogóle łączy xD
//import * as io from 'socket.io/socket.io-client';
const socket = io();
var form = document.getElementById('form');
var input = document.getElementById('input');
function login_user(e){
    console.log('kliknięto logowanie')
    let log = document.querySelector('[name="login"]').value;
    let pwd =document.querySelector('[name="password"]').value;
    let query = `{"login" : "${log}" , "password" : "${pwd}"}`;
    console.log(query);
    query = JSON.parse(query);
    socket.emit('login', query);
}
