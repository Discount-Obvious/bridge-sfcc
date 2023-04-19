'use strict';

const { io } = require('socket.io-client');
let socket;
let instance;

/**
 * Generates a HTML response element with a specific index.
 *
 * @param {number} index - The index of the response element.
 * @return {string} - A HTML string representing the response element.
 */
function generateResponseElement(index) {
    return `<p data-index="${index}" 
                class="bgpt-prior-response bgpt-chat-line bgpt-response-js response-${index}-js">
                <strong>Chat Agent</strong>: 
                <span class="bgpt-response-text-js response-text-${index}-js"></span>
            </p>`;
}

/**
 * Generates a HTML question element with a specific index and question text.
 *
 * @param {number} index - The index of the question element.
 * @param {string} question - The text of the question.
 * @return {string} - A HTML string representing the question element.
 */
function generateQuestionElement(index, question) {
    return `<p data-index="${index}" 
                class="bgpt-prior-question bgpt-chat-line bgpt-question-js question-${index}-js">
                <strong>You</strong>: 
                <span class="bgpt-question-text-js question-text-${index}-js">${question}</span>
            </p>`;
}

/**
 * Gathers all the responses from the chat history and returns an array of response objects.
 *
 * @return {Array} - An array of response objects, each containing the response's index and text.
 */
function gatherResponses() {
    const responses = [];
    $('.bgpt-response-text-js').each((index, response) => {
        responses.push({ index, text: $(response).text() });
    });
    return responses;
}

/**
 * Gathers all the questions from the chat history and returns an array of question objects.
 *
 * @return {Array} - An array of question objects, each containing the question's index and text.
 */
function gatherQuestions() {
    const questions = [];
    $('.bgpt-question-text-js').each((index, question) => {
        questions.push({ index, text: $(question).text() });
    });
    return questions;
}

/**
 * Stores the access token and its expiration time in the browser's local storage.
 *
 * @param {string} token - The access token to be stored.
 */
function storeAccessToken (token) {
    const expirationTime = Date.now() + 14400 * 1000;
    window.localStorage.setItem('bridge_token', token);
    window.localStorage.setItem('bridge_token_expiration', expirationTime.toString());
}

/**
 * Stores the refresh token and its expiration time in the browser's local storage.
 *
 * @param {string} token - The refresh token to be stored.
 */
function storeRefreshToken (token) {
    const expirationTime = Date.now() + 604800 * 1000;
    window.localStorage.setItem('bridge_refresh_token', token);
    window.localStorage.setItem('bridge_refresh_token_expiration', expirationTime.toString());
}

/**
 * Retrieves a new access token from the server using a URL stored in a data attribute of a DOM element.
 *
 * @async
 * @returns {Promise<object|null>} A promise that resolves to the access token object if the request is successful, or null if it fails.
 */
async function getNewAccessToken () {
    const tokenUrl = $('.bridge-item-js').data('token-url');
    const response = await fetch(tokenUrl, {
        method: 'GET'
    });

    if (response.ok) {
        return await response.json();
    } else {
        return null;
    }
}

/**
 * Retrieves the access token from the browser's local storage, or retrieves a new access token from the server if the stored token has expired or is invalid.
 *
 * @async
 * @returns {Promise<string|null>} A promise that resolves to the access token string if it is valid, or null if it cannot be retrieved.
 */
async function getToken () {
    const token = window.localStorage.getItem('bridge_token');
    const expirationTime = window.localStorage.getItem('bridge_token_expiration');
    if (token && token != 'undefined' && expirationTime && Date.now() < parseInt(expirationTime, 10)) {
        return token;
    } else {
        const newTokens = await getNewAccessToken();
        if (newTokens) {
            storeAccessToken(newTokens.accessToken);
            storeRefreshToken(newTokens.refreshToken);
            return newTokens.accessToken;
        }

        window.localStorage.removeItem('bridge_token');
        window.localStorage.removeItem('bridge_token_expiration');
        window.localStorage.removeItem('bridge_refresh_token');
        window.localStorage.removeItem('bridge_refresh_token_expiration');
        return null;
    }
}

/**
 * Generates a conversation history array from the provided response and question arrays.
 *
 * @param {Array} responses - An array of response objects, each containing the response's index and text.
 * @param {Array} questions - An array of question objects, each containing the question's index and text.
 * @return {Array} - An array of conversation objects, each containing the role ('user' or 'assistant') and content (text of the response/question).
 */
function generateConversationHistory(responses, questions) {
    const conversationHistory = [];

    for (let i = 0; i < responses.length; i++) {
        if (responses[i]) {
            conversationHistory.push({ role: 'assistant', content: responses[i].text });
        }

        if (questions[i]) {
            conversationHistory.push({ role: 'user', content: questions[i].text });
        }
    }

    return conversationHistory;
}

/**
 * Formats a question string by trimming whitespace, capitalizing the first letter and converting the rest to lowercase.
 *
 * @param {string} question - The string to format.
 * @return {string} - The formatted question string.
 */
function formatQuestion(question) {
    const trimmedQuestion = question.trim();
    let capitalizedQuestion = trimmedQuestion.charAt(0).toUpperCase() + trimmedQuestion.slice(1).toLowerCase();
    return capitalizedQuestion;
}

/**
 * Calls the chat GPT with the provided context and socket.
 *
 * @param {string} context - The context of the chat, either 'general' or 'product'.
 * @param {Socket} socket - The socket to use for communication with the server.
 */
function callChatGPT(context, socket) {
    const priorResponses = gatherResponses();
    const priorQuestions = gatherQuestions();
    const currentQuestion = formatQuestion($('.bgpt-question-js').val());
    const conversationHistory = generateConversationHistory(priorResponses, priorQuestions);
    $('.bgpt-response-block-js').prepend(generateQuestionElement(priorResponses.length, currentQuestion));
    const questionRequestBody = {
        conversationHistory,
        currentQuestion,
        index: priorResponses.length,
        context,
        origin: instance
    };

    if (context === 'product') {
        questionRequestBody.publicProductData = $('#bgptQuestionsModal').data('public-product-details');
    }

    socket.emit('question', questionRequestBody);
}

/**
 * Initializes a socket with the provided bridge token and returns it.
 *
 * @param {string} bridgeToken - The token to use for authorization.
 * @return {Socket} - The initialized socket.
 */
function initializeSocket(bridgeToken) {
    const socket = io('https://bridgegpt.ai/', {
        query: {
            token: bridgeToken
        }
    });

    return socket;
}

/**
 * Initializes event listeners for the provided socket.
 *
 * @param {Socket} socket - The socket to add event listeners to.
 */
function intializeSocketEventListeners(socket) {
    socket.on('initialData', () => {
        $('.bgpt-response-block-js').addClass('chat-border');
        $('.bridgegpt-spinner-js').css({ display: 'flex' });
    });

    socket.on('messageBegin', () => {
        $('.bridgegpt-spinner-js').hide();
    });

    socket.on('chatResponse', (data) => {
        const textResponse = data.text;
        const dataText = textResponse === 'NEW' || textResponse === '-' ? '<br/>' : data.text;
        $(`.response-text-${data.index}-js`).append(dataText);
    });

    socket.on('revealResponse', (data) => {
        $('.bgpt-response-block-js').prepend(generateResponseElement(data.index));
        $(`.response-${data.index}-js`).addClass('reveal');
    });

    socket.on('rejectQuestion', (data) => {
        $('.bgpt-response-block-js').prepend(generateResponseElement(data.index));
        $(`.response-text-${data.index}-js`).replaceWith(`<span>${data.errorMessage}</span>`);
        $(`.response-${data.index}-js`).addClass('reveal');
        $('.bridgegpt-spinner-js').hide();
    });

    socket.on('done', (data) => {
        if (data.error) {
            $('.question-error-message-js').show().text(data.errorMessage);
        } else {
            $('.bgpt-question-js').val('');
            if ($('.conversation-id-js').val() === '' && data.conversationId) {
                $('.conversation-id-js').val(data.conversationId);
            }
        }
    });
}

/**
 * Initializes the Bridge GPT chat by checking for a stored token in sessionStorage and initializing a socket with the token.
 * If no token is found, a token is retrieved from the server and stored in sessionStorage.
 */
async function initializeBridgeGPT() {
    var bridgeToken = await getToken();
    socket = initializeSocket(bridgeToken);
    intializeSocketEventListeners(socket);
    instance = location.href;
}

function eventListeners() {
    $('.bgpt-questions-plp-link-js, .bgpt-questions-pdp-link-js').on('click', function (e) {
        e.preventDefault();
        initializeBridgeGPT();
        var $productWrapper = $(this).closest('.product') || $(this).closest('.product-wrapper');
        var pid = $(this).data('pid') || $productWrapper.data('pid');
        $('.bgpt-ask-question-js').data('context', 'product');

        $.ajax({
            url: $(this).data('public-product-details') + '?pid=' + pid,
            type: 'get',
            success: function (data) {
                $('.product-to-ask-about-js').text(data['Product Name']);
                $('#bgptQuestionsModal').data('pid', pid);
                $('#bgptQuestionsModal').data('public-product-details', JSON.stringify(data));
                $('#bgptQuestionsModal').addClass('show');
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    $('.bgpt-questions-help-link-js').on('click', function (e) {
        e.preventDefault();

        $('#bgptQuestionsModal').addClass('show');
        $('.bgpt-ask-question-js').data('context', 'help');
    });

    $('#bgptQuestionsModal .close, .cancel-btn-js').on('click', function (e) {
        $('#bgptQuestionsModal').removeClass('show');
    });

    $('.bgpt-ask-question-js').on('click', function (e) {
        e.preventDefault();
        const context = $(this).data('context');
        callChatGPT(context, socket);
    });

    $('.bgpt-question-js').on('keydown', function (e) {
        if (e.keyCode == 13) {
            $('.bgpt-ask-question-js').click();
        }
    });
}

eventListeners();

