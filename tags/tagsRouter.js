const router = require('express').Router();

const Tags = require('./tagsModel.js');
const Authors = require('../authors/authorsModel.js');
const Posts = require('../posts/postsModel.js');
const restricted = require('../auth/restriction.js');

const { compare, compare1 } = require('../tags/tagsHelpers.js');

const { cache } = require('../cache/cacheHelpers.js');
/*
- tags endpoints:	
  - [ ] add tag to post
*/

// GET:  gets authors per all tags
	// /tags/authors
	// chain getAllTags, getAllAuthorsByAllTags
	// TODO:  add totalLikesCount, totalReadsCount
router.get('/authors', restricted, cache(10), (req, res) => {
	Tags.getAllTags()
		.then(allTags => {
			Tags.getAllAuthorsByAllTags()
				.then(authorsByAllTags => {
					Authors.getPostsByAllAuthors()
						.then(postsByAllAuthors => {
							Authors.getAllTotalLikesCount()
							.then(allTotalLikesCounts => {
								Authors.getAllTotalReadsCount()
									.then(allTotalReadsCounts => {
																				
										authorsByAllTags = authorsByAllTags.filter((thing, index, self) => 
											index === self.findIndex(t => t.id === thing.id));
											authorsByAllTags.sort(compare);

										allTotalLikesCounts.sort(compare1);
										allTotalReadsCounts.sort(compare1);

										let newTagsList = allTags;
										let tagNameToMatch, authorsTagNameToMatch, authorToAdd, authorToMatch, 
											postsAuthorToMatch, authorBio, authorName;	
										let currentAuthorsPosts = [];

										for(let x = 0; x < newTagsList.length;x++){
											tagNameToMatch = newTagsList[x].tagname;
											newTagsList[x].authors = [];
										
											for(let y = 0; y < authorsByAllTags.length; y++){

												authorsTagNameToMatch = authorsByAllTags[y].tagname;
												authorToMatch = authorsByAllTags[y].id;
												authorBio = authorsByAllTags[y].bio;
												authorName = authorsByAllTags[y].author;
									
												currentTLCauthorsID = allTotalLikesCounts[y].authorsid;
												currentTLCValue = allTotalLikesCounts[y].totallikecount;
								
												currentTRCauthorsID = allTotalReadsCounts[y].authorsid;
												currentTRCValue = allTotalReadsCounts[y].totalreadcount;
									
									
												for(let z = 0; z < postsByAllAuthors.length; z++){
													
													postsAuthorToMatch = postsByAllAuthors[z].authorId;
						
													if(Number(postsAuthorToMatch) === Number(authorToMatch)  && 
													postsByAllAuthors[z].tags.includes(tagNameToMatch) && !currentAuthorsPosts.includes(postsByAllAuthors[z])){
						
														currentAuthorsPosts.push(postsByAllAuthors[z]);
													}
												}
													
												if(tagNameToMatch === authorsTagNameToMatch){
											
													authorToAdd = {
														"bio": authorBio,
														"id": authorToMatch,
														"author": authorName,
														"posts": currentAuthorsPosts,
														"totalLikeCount": currentTLCValue,
														"totalReadCount": currentTRCValue,
													};
											
													newTagsList[x].authors.push(authorToAdd);
													authorToAdd = {};
													currentAuthorsPosts = [];
												}
											}   
										}

										res.status(200).json(newTagsList);
								})
								.catch(err => res.send(err));
							})
							.catch(err => res.send(err));

						})
						.catch(err => res.send(err));
				})
				.catch(err => res.send(err));
		})
		.catch(err => res.send(err));
});

// GET:  gets posts per all tags
    // /tags/posts
	// chain getAllTags, getAllPostsByAllTags
router.get('/posts', restricted, (req, res) => {
	Tags.getAllTags()
		.then(tags => {
			Tags.getAllPostsByAllTags()
				.then(postsByAllTags => {

					res.status(200).json({tags: tags, posts: postsByAllTags});

				})
				.catch(err => res.send(err));
		})
		.catch(err => res.send(err));
});

// GET:  posts AND authors per all tags
	// /tags
	// chain getAllTags, getAllAuthorsByAllTags, getAllPostsByAllTags
router.get('/', restricted, (req, res) => {
	Tags.getAllTags()
		.then(tags => {
			Tags.getAllAuthorsByAllTags()
				.then(authorsByAllTags => {
					Tags.getAllPostsByAllTags()
						.then(postsByAllTags => {

							res.status(200).json({tags: tags, 
												  authors: authorsByAllTags, 
												  posts: postsByAllTags
												});

						})
						.catch(err => res.send(err));
				})
				.catch(err => res.send(err));
		})
		.catch(err => res.send(err));
});


// GET:  get all authors per single tag
	// /tags/<tag>/authors
	// chain getOneTag, getAllAuthorsByOneTag
router.get('/:tagname/authors', restricted, (req, res) => {
	const tagName = req.params.tagname;
	Tags.getOneTag(tagname)
		.then(tag => {
			Tags.getAllAuthorsByOneTag(tagname)
				.then(authorsByOneTag => {

					res.status(200).json({tag: tag, authors: authorsByOneTag});

				})
				.catch(err => res.send(err));
		})
		.catch(err => res.send(err));
});

// GET:  get all posts per single tag
    // /tags/<tag>/posts
	// chain getOneTag, getAllPostsByOneTag
router.get('/:tagname/posts', restricted, (req, res) => {
	const tagName = req.params.tagname;
	Tags.getOneTag(tagName)
		.then(tags => {
			Tags.getAllPostsByOneTag(tagName)
				.then(postsByOneTag => {

					res.status(200).json({tags: tags, posts: postsByOneTag});

				})
				.catch(err => res.send(err));
		})
		.catch(err => res.send(err));
});

// GET:  get all posts AND authors per single tag
	// /tags/<tag>
	// chain getOneTag, getAllAuthorsByOneTag, getAllPostsByOneTag
router.get('/:tagname', restricted, (req, res) => {
	const tagName = req.params.tagname;
	Tags.getOneTag(tagName)
		.then(tags => {
			Tags.getAllAuthorsByOneTag(tagName)
				.then(authorsByOneTag => {

					Tags.getAllPostsByOneTag()
					.then(postsByOneTag => {

						res.status(200).json({tags: tags, authors: authorsByOneTag, posts: postsByOneTag});

					})
					.catch(err => res.send(err));
				})
				.catch(err => res.send(err));
		})
		.catch(err => res.send(err));
});

// GET:  get all tags for one post
	// /tags/posts/<postsid>
	// getTagsByPost(postsID)
router.get('/posts/:postsid', restricted, (req, res) => {
	const postsID = req.params.postsid;
	Tags.getTagsByPost(postsID)
		.then(tags => {
			res.status(200).json({tags: tags});
		})
		.catch(err => res.send(err));
});

// GET:  gets one tag record
router.get('/:tagsid', restricted, (req, res) => {
	const tagsid = req.params.tagsid;
	if (!tagsid) {
		res.status(404).json({ message: `The tag with the specified tagsid ${tagsid} does not exist.` });
	} else {
		Tags.findById(tagsid)
			.then(tag => {
				res.status(200).json(tag);
			})
			.catch(err => {
				res.status(500).json({ message: `The tag information could not be retrieved.`, error: err });
			});
	}
});

// POST:  record tag
router.post('/', restricted, (req, res) => {
	const newTag = req.body;

	Tags.add(newTag)
		.then(tag => {
			res.status(201).json(tag);
		})
		.catch(err => {
			res.status(500).json({ message: `Failed to create new tag.`, error: err });
		});
});

// PUT:  update tag record
router.put('/:tagsid', restricted, (req, res) => {
	const tagsid = req.params.tagsid;
	const updatedTag = req.body;

	Tags.update(tagsid, updatedTag)
		.then(tag => {
			if (tag) {
				res.json(tag);
			} else {
				res.status(404).json({ message: `Could not find tag with given id ${tagsid}.` });
			}
		})
		.catch(err => {
			res.status(500).json({ message: `Failed to update tag.`, error: err });
		});
});

// DELETE:  delete tag record
router.delete('/:tagsid', restricted, (req, res) => {
	const tagsid = req.params.tagsid;
	if (!tagsid) {
		res.status(404).json({ message: `The tag with the specified ID ${tagsid} does not exist.` });
	}
	Tags.remove(tagsid)
		.then(tag => {
			res.json(tag);
		})
		.catch(err => {
			res.status(500).json({ message: `The tag could not be removed.`, error: err });
		});
});

module.exports = router;
