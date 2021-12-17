# user-authentication app using NodeJs, expressJs and mongoDB

### **npm run dev** to run the project

###### List of APIs:-
1. SignUp: In this API user have to provide name, email, password and profile picture. We saved the profile picture into Cloudinary(https://cloudinary.com/)
2. SignIn: After Successfully login we have to generate the JWT token.
3. ForgetPassword:- If user forget his/her password then he/she have to provide their email address which is register into DB. After that we will send one reset password link. For sending email in user's email here I used mailgun-js(https://www.mailgun.com/)
4. ResetPassword:- After he/she get the reset password link then only he/she can change the password with new one.
5. getUserInfo:- After validate the JWT token we will send the all user information.
