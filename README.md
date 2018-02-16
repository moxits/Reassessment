# Reassessment
Web application to allow businesses to create profiles so that users can find, review, and bookmark them. 


HOW TO GET STARTED 

1.Clone the master branch to your computer
2.In the terminal go to the directory you cloned the project to.
3. Run 'npm install' 
4. Download postgres if you have not done so already
5. Create your postgres user, with your own username and password
6. Using PGadmin or the command line, create a database named 'ReviewRtest'
7. If your username and password are different than 'postgres' and 'moxit1998' then navigate to the postgres.js file
and replace 'postgres://postgres:moxit1998@localhost:5432/ReviewRtest' with 'postgres://username:password@localhost:5432/ReviewRtest'
where username and password are your username and password

FOR TESTING
1. In the terminal go to the directory where this project is located
2. Run 'npm test' for mocha testing
---WARNING:Running npm test will empty all three tables in the database---

FOR USE 
1. Run 'npm start' in order to start the application
2. In your browser go to  http://localhost:3000 to go the homepage
3. If you would like to prepopulate it with some businesses, enter http://localhost:3000/populate into your browser,
this should redirect you to the homepage after it runs the queries.

Features
1. The homepage will allow any user to login or signup, search for businesses, and view the most recent businesses that have joined 
2. After registering and logging in, a personal account will be able to update their account, write reviews on businesses,
bookmark businessses,search for other businesses, and visit the profiles of other users and businesses.
3. After registering and logging in, a business account will be able to update their account, search for other businesses,and
view business and personal profiles. 
4. All users can search for businesses by their name or the two categories associated with their business. They can also optionally
choose to search by city, state, or both along with their name or category entry.
5. Personal users will be able to bookmark and unbookmark businesses and view those bookmarked businesses on their profile page. The bookmarks
are only visible to the user itself. 
6. Writing reviews consists of content and the rating. Once the user posts the review they will be directed back to the business page 
where the appropriate changes to the rating and number of reviews should occur. They will be able to also view reviews that other
users have wrote. The reviews a user writes will appear on their profile page.

TECHNOLOGIES
HTML/CSS
Javascript
nodeJs 
PostgreSQL
Sequelize library 
Raw queries 
Unit testing with mocha/chai
Express
Styling: Bootstrap,yelpcdn
