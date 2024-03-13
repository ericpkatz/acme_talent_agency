const {
  client,
  createTables,
  createUser,
  createSkill,
  createUserSkill,
  fetchUsers,
  fetchSkills,
  fetchUserSkills,
  destroyUserSkill
} = require('./db');
const express = require('express');
const app = express();

app.get('/api/skills', async(req, res, next)=> {
  try {
    res.send(await fetchSkills());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await fetchUsers());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users/:id/userSkills', async(req, res, next)=> {
  try {
    res.send(await fetchUserSkills(req.params.id));
  }
  catch(ex){
    next(ex);
  }
});

const init = async()=> {
  console.log('connecting to database');
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created.');
  const [moe, lucy, ethyl, juggling, spinning, yodeling, bartending] = await Promise.all([
    createUser({ username: 'moe', password: '123'}),
    createUser({ username: 'lucy', password: '123'}),
    createUser({ username: 'ethyl', password: '1234'}),
    createSkill({ name: 'juggling'}),
    createSkill({ name: 'spinning'}),
    createSkill({ name: 'yodeling'}),
    createSkill({ name: 'bartending'})
  ]);
  console.log(await fetchUsers());
  console.log(await fetchSkills());

  const [lucyYodels, lucyBartends] = await Promise.all([
    createUserSkill({ user_id: lucy.id, skill_id: yodeling.id}),
    createUserSkill({ user_id: lucy.id, skill_id: bartending.id}),
  ]);
  console.log(await fetchUserSkills(lucy.id));

  //test that this errors! moe does not yodel!
  //await destroyUserSkill({ user_id: moe.id, id: lucyYodels.id });
  await destroyUserSkill(lucyBartends);

  console.log(await fetchUserSkills(lucy.id));

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> {
    console.log(`listening on port ${port}`);
    console.log(`curl localhost:${port}/api/skills`);
    console.log(`curl localhost:${port}/api/users`);
    console.log(`curl localhost:${port}/api/users/${lucy.id}/userSkills`);
  });

};

init();