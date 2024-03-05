import post from '../../db.json'
import user from '../../db.json'
import {faker} from "@faker-js/faker";

post.id = faker.number.int({ min: 10, max: 100 });
user.id = faker.number.int({ min: 10, max: 100 });
user.email = faker.internet.email();
user.password = faker.internet.password();

describe('Exam API tests', () => {
    let postId;
    it(' Get all posts. Verify HTTP response status code and content type', () => {
        cy.request({
          method: 'GET',
          url: '/posts',
          headers: {
            'Content-Type': 'application/json'
          }
        }).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.include('application/json');
        });
      });
    it('Get only first 10 posts. Verify HTTP response status code and first 10 posts', () => {
        cy.request({
            method: 'GET',
            url: '/posts?_start=10&_limit=10',
        }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.lengthOf(10);

        });
    });
    it('Get posts with id = 55 and id = 60. Verify HTTP response status code and IDs of returned records', () => {
            const ids = [55, 60];
            const jointId = ids.map(id => `id=${id}`).join('&');

            cy.request({
                method: 'GET',
                url: `/posts?${jointId}`,
            }).then((response) => {
                expect(response.status).to.equal(200);

                const posts = response.body;
                posts.forEach((post) => {
                    expect(ids).to.include(post.id);
                    })
            })
            });
    it('Create a post. Verify HTTP response status code', () => {
        const postData = {
            title: 'New Post',
            body: 'This is a new post created via API'
        };
        cy.request({
            method: 'POST',
            url: '/664/posts',
            body: postData,
            failOnStatusCode: false
        }).then(response => {
            expect(response.status).to.equal(401);
        });
    });
    it('Create post with access token in header. Verify HTTP response status code and post creation', () => {
        cy.log('Register user');
        let accessToken;
        cy.request({
            method: 'POST',
            url: '/register',
            body: {
                email: user.email,
                password: user.password
            }
        }).then((responseUser) => {
            expect(responseUser.status).to.equal(201);
            accessToken = responseUser.body.accessToken;

            cy.log('Create post with token');
            const postData = {
                title: 'New Post',
                body: 'Post body'
            };
            cy.request({
                method: 'POST',
                url: '/664/posts',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                body: postData
            }).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.title).to.equal(postData.title);
                expect(response.body.body).to.equal(postData.body);
            });
        });
    });
    it('Create post entity and verify that the entity is created', () => {
        const postData = {
            title: 'New Post',
            body: 'New post created via API'
        };
        cy.request({
            method: 'POST',
            url: '/posts',
            body: postData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.title).to.equal(postData.title);
            expect(response.body.body).to.equal(postData.body);
            expect(response.body.userId).to.equal(postData.userId);
            expect(response.body).to.have.property('id');
        });
    });
    it('Update non-existing entity. Verify HTTP response status code', () => {
        const id = [];
        const updatedPostData = {
            title: 'Updated title',
            body: 'Updated body'
        };
        cy.request({
            method: 'PUT',
            url: `/posts/${id}`,
            body: updatedPostData,
            failOnStatusCode: false // Allow the test to continue even if the request fails
        }).then(response => {
            expect(response.status).to.be.equal(404);
        });
    });
    it('Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated', () => {
        cy.log('Create post entity');
        const postData = {
            title: 'New Post',
            body: 'New Post Body'
        };
        cy.request({
            method: 'POST',
            url: '/posts',
            body: postData
        }).then(createResponse => {
            expect(createResponse.status).to.equal(201);
            postId = createResponse.body.id;

            cy.log('Update the newly created post');
            const updatedPostData = {
                title: 'Updated Post',
                body: 'Updated Post Body'
            };

            cy.request({
                method: 'PUT',
                url: `/posts/${postId}`,
                body: updatedPostData
            }).then(updateResponse => {
                expect(updateResponse.status).to.equal(200);
                expect(updateResponse.body.title).to.equal('Updated Post');
                expect(updateResponse.body.body).to.equal('Updated Post Body');

                cy.log('Verify that the entity is updated');
                cy.request(`/posts/${postId}`).then(getResponse => {
                    expect(getResponse.status).to.equal(200);
                    expect(getResponse.body.title).to.equal('Updated Post');
                    expect(getResponse.body.body).to.equal('Updated Post Body');
                });
            });
        });
    });
    it('Delete non-existing post entity. Verify HTTP response status code', () => {
        const id = [];
        cy.request({
            method: 'DELETE',
            url: `/posts/${id}`,
            failOnStatusCode: false
        }).then(response => {
            expect(response.status).to.equal(404);
        });
    });
    it('Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted', () => {
        cy.log('Create post entity');
        const postData = {
            title: 'New Post',
            body: 'New Post Body'
        };
        cy.request({
            method: 'POST',
            url: '/posts',
            body: postData
        }).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body).to.have.property('id');
            postId = response.body.id;

            cy.log('Update new created post');
            const updatedPostData = {
                title: 'Updated Post',
                body: 'Updated Post Body'
            };
            cy.request({
                method: 'PUT',
                url: `/posts/${postId}`,
                body: updatedPostData
            }).then(updateResponse => {
                expect(updateResponse.status).to.equal(200);

                cy.log('Delete the post');
                cy.request({
                    method: 'DELETE',
                    url: `/posts/${postId}`
                }).then(deleteResponse => {
                    expect(deleteResponse.status).to.equal(200);

                    cy.log('Verify that the entity is deleted');
                    cy.request({
                        method: 'GET',
                        url: `/posts/${postId}`,
                        failOnStatusCode: false
                    }).then(getResponse => {
                        expect(getResponse.status).to.equal(404);
                    });
                });
            });
        });
});
    });





