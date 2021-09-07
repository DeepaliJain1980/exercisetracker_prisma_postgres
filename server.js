
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));





/*-------------------------------------------------------------------------------*/
//   Entry Point 
//   http://localhost:3000
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


/*-------------------------------------------------------------------------------*/
//  Post method To create new user with prisma 
//   http://localhost:3000/api/users
//    req.body.username:<userName>
/*    Response should be like
{
  username: "fcc_test",
  _id: "5fb5853f734231456ccb3b05"
}
*/
app.post('/api/users', (req, res) => {
let myUser= req.body.username;
console.log(myUser);
prisma.user.create({
  data:{
    username:myUser
  }
})
  .then(result=>{
    res.json({username:result.username,id:result.id});
    console.log(result);}) 
  .catch(err=>{console.log(err);});
});



/*-------------------------------------------------------------------------------*/
//  Get Method To get array of users with prisma 
//   http://localhost:3000/api/users
/*    Response should be like
[{
  username: "fcc_test",
  id: "5fb5853f734231456ccb3b05"
},
{
  username: "fcc_test2",
  id: "5fb5853f734231456ccb3b06"
]
*/
app.get('/api/users', (req, res) => {
    prisma.user.findMany({
      select: {
        id:true,
        username: true,
     }
  })
    .then(result=>
        {
          console.log(result);
          res.json(result);
        }
      ) 
    .catch(err=>{console.log(err);});
  });


/*-------------------------------------------------------------------------------*/
//   Post method to add exercise related data of particular user
//   http://localhost:3000/api/users/:id/exercises
//   http://localhost:3000/api/users/5fb5853f734231456ccb3b05/exercises
//    req.body.id:<id>          //User's id
//    req.params.id:<id>          //User's id
//    req.body.description:<description>
//    req.body.duration:<duration>   // should be Integer
//    req.body.date:<date>            // yyyy-mm-dd
/*    Response should be like
{
  username: "fcc_test"
  description: "test",
  duration: 60,
  date: "Mon Jan 01 1990",
  id: "5fb5853f734231456ccb3b05"
}
*/
app.post("/api/users/:id/exercises", (req,res)=>{

  if(!(req.body.description && req.body.duration && req.params.id))
  {
    return res.send({error:"Necessary Fields are required"});
  }
        
  prisma.user.findUnique({
    where:{
      id:req.params.id
    }
  })
  .then((user)=>{
    if(!user){
      return res.send({error:"User with this Id does not exist"});
    }
    var myDate=Boolean(req.body.date)?new Date(req.body.date):new Date();
    prisma.exercise.create({
        data:{
          description: req.body.description, 
          duration: parseInt(req.body.duration),
          date: myDate,
          user:{
            connect:{
              id:req.params.id
            }
          }
        },
        include:{
          user:true
        }
      })
     .then(userData=>
        {
          console.log(userData);
          res.send({      
            username:userData.user.username,
            description: req.body.description,
            duration: parseInt(req.body.duration),
            date: myDate.toDateString(),
            id:userData.user.id
          })
        })
  })
  .catch(err=>console.log(err));
});



/*-------------------------------------------------------------------------------*/
//   Get method to add exercise related data of particular user
//   http://localhost:3000/api/users/:id/logs?[from][&to][&limit]
//    [ ] = optional
//    from, to = dates (yyyy-mm-dd); limit = number
//    http://localhost:3000/api/users/5fb5853f734231456ccb3b05/logs
//    req.params.id:<id>               //User's id
//    req.query.from:<fromDate>        // yyyy-mm-dd
//    req.query.to:<toDate>            // yyyy-mm-dd
//    req.query.limit:<limit>          // should be Integer 
/*    Response should be like
{
  username: "fcc_test",
  count: 1,
  id: "5fb5853f734231456ccb3b05",
  log: [{
    description: "test",
    duration: 60,
    date: "Mon Jan 01 1990",
  }]
}
*/
app.get("/api/users/:id/logs", (req, res) => {
  let userId=req.params.id;
  let fromD=req.query.from?new Date(req.query.from):new Date(0);
  let to=req.query.to?new Date(req.query.to):new Date(Date.parse(new Date()) + 8640000*30*12);
  let limit=req.query.limit?+req.query.limit:1000;

  prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      exercises: {
        select:{
          description: true,
          duration:true,
          date:true
        },
        where:{
          AND: [
            {
              date: {
                gte: fromD,
              },
            },
            {
              date: {
                lte: to,
              },
            },
          ],
        },
        orderBy: {
          date: 'asc',
              },
        take:limit
      },
  }})
  .then(data=>{
    if(!data){
      return res.send({
        error:"User with this id does not exist"})
    }

    var log=data.exercises.map(item=>{
      return{description:item.description, 
            duration:+item.duration,
            date:new Date(item.date).toDateString()
            }

    });

    res.send({
              username:data.username, 
              count:data.exercises.length, 
              id:data.id,
              log:log
            })
  })
  .catch(err=>console.log(err));
});//end of function



/*-------------------------------------------------------------------------------*/
//entry point
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});




