exports.up = function(knex) {
    return knex.schema.createTable('tags', tags => {
  
      tags.increments('tagsid');
  
      tags
        .string('tagName', 256)
        .notNullable()
        .unique();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('tags');
  }