<?php
if($_POST)
{
    $to_Email       = "farhanjanjua94@gmail.com"; //Replace with recipient email address
    //$subject        = 'Alpine HTML TEMPLATE'; //Subject line for emails
    //check if its an ajax request, exit if not
    if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) AND strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {

        //exit script outputting json data
        $output = json_encode(
        array(
            'type'=>'error',
            'text' => 'Request must come from Ajax'
        ));
        die($output);
    }
    //check $_POST vars are set, exit if any missing
    if(!isset($_POST["userName"]) || !isset($_POST["userEmail"]) || !isset($_POST["userPhone"]) || !isset($_POST["userMessage"]))
    {
        $output = 'Input fields are empty!';
        die($output);
    }

    //Sanitize input data using PHP filter_var().
    $user_Name        = filter_var($_POST["userName"], FILTER_SANITIZE_STRING);
    $user_Email       = filter_var($_POST["userEmail"], FILTER_SANITIZE_EMAIL);
    $userPhone     = filter_var($_POST["userPhone"], FILTER_SANITIZE_STRING);
    $userSubject     = filter_var($_POST["usersubject"], FILTER_SANITIZE_STRING);
    $userCmnt     = filter_var($_POST["userMessage"], FILTER_SANITIZE_STRING);

    //additional php validation
    if(strlen($user_Name)<4) // If length is less than 4 it will throw an HTTP error.
    {
        $output = 'Name is too short or empty!';
        die($output);
    }
    if(!filter_var($user_Email, FILTER_VALIDATE_EMAIL)) //email validation
    {
        $output = 'Please enter a valid email!';
        die($output);
    }
    if(strlen($userCmnt)<5) //check emtpy message
    {
        $output = 'Too short message! Please enter something!';
        die($output);
    }

    //proceed with PHP email.
    $headers = 'From: '.$user_Email.'' . "\r\n" .
    'Reply-To: '.$user_Email.'' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

        // send mail
    $sentMail = @mail($to_Email, $userSubject, $userCmnt .'  -'.$user_Name, $headers);

    if(!$sentMail)
    {
        $output = 'Could not send mail! Please check your PHP mail configuration!';
        die($output);
    }else{
        $output = 'Hi '.$user_Name .' Thank you for your email!';
        die($output);
    }
}
?>
