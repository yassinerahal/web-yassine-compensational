/* A builder class to simplify the task of creating HTML elements */
class ElementCreator {
    constructor(tag) {
        this.element = document.createElement(tag);
    }

    id(id) {
        this.element.id = id;
        return this;
    }

    class(clazz) {
        this.element.class = clazz;
        return this;
    }

    text(content) {
        this.element.innerHTML = content;
        return this;
    }

    with(name, value) {
        this.element.setAttribute(name, value)
        return this;
    }

    listener(name, listener) {
        this.element.addEventListener(name, listener)
        return this;
    }

    append(child) {
        child.appendTo(this.element);
        return this;
    }

    prependTo(parent) {
        parent.prepend(this.element);
        return this.element;
    }

    appendTo(parent) {
        parent.append(this.element);
        return this.element;
    }

    insertBefore(parent, sibling) {
        parent.insertBefore(this.element, sibling);
        return this.element;
    }

    replace(parent, sibling) {
        parent.replaceChild(this.element, sibling);
        return this.element;
    }
}

/* A class representing a resource. This class is used per default when receiving the
   available resources from the server (see end of this file).
   You can (and probably should) rename this class to match with whatever name you
   used for your resource on the server-side.
 */
// This function is responsible for rendering all the animals in the model
function renderAllAnimals(animals) {
    const container = document.getElementById('resource-list');
    container.innerHTML = ''; // Clear the container before rendering

    animals.forEach(animal => {
        renderAnimal(animal);
    });
}

// Fetch the list of animals from the server
function fetchAnimals() {
    fetch('/api/resources')  // Replace '/api/resources' with your actual endpoint
        .then(response => response.json())
        .then(data => {
            // Call the render function to display the animals
            renderAllAnimals(data);
        })
        .catch(error => {
            console.error('Error fetching animals:', error);
        });
}

// Call this function when the page loads to fetch and render animals
fetchAnimals();


class Resource {

    /* If you want to know more about this form of getters, read this:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get */
    get idforDOM() {
        return `resource-${this.id}`;
    }

}

function add(resource, sibling) {

    const creator = new ElementCreator("article")
        .id(resource.idforDOM);

    /* Task 2: Instead of the name property of the example resource, add the properties of
       your resource to the DOM. If you do not have the name property in your resource,
       start by removing the h2 element that currently represents the name. For the 
       properties of your object you can use whatever html element you feel represents
       your data best, e.g., h2, paragraphs, spans, ... 
       Also, you don't have to use the ElementCreator if you don't want to and add the
       elements manually. */

       creator
       .append(new ElementCreator("h2").text(resource.name))
       .append(new ElementCreator("div")
           .class("animal-details")
           .append(new ElementCreator("p").text(`Age: ${resource.age}`))
           .append(new ElementCreator("p").text(`Is Wild: ${resource.isWild}`))
       );

    creator
        .append(new ElementCreator("button").text("Edit").listener('click', () => {
            edit(resource);
        }))
        .append(new ElementCreator("button").text("Remove").listener('click', () => {
            /* Task 3: Call the delete endpoint asynchronously using either an XMLHttpRequest
               or the Fetch API. Once the call returns successfully, remove the resource from
               the DOM using the call to remove(...) below. */
                           fetch(`/api/resources/${resource.id}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete the resource from the server.');
                    }
                    // If DELETE is successful, remove the animal from the DOM
                    remove(resource);
                })
                .catch(error => {
                    console.error('Error deleting resource:', error);
                });
        }));

    const parent = document.querySelector('main');

    if (sibling) {
        creator.replace(parent, sibling);
    } else {
        creator.insertBefore(parent, document.querySelector('#bottom'));
    }
        
}

function edit(resource) {
    const formCreator = new ElementCreator("form")
        .id(resource.idforDOM)
        .append(new ElementCreator("h3").text("Edit " + resource.name));
    
    // Add form fields for resource properties
    formCreator
        .append(new ElementCreator("label").text("Name").with("for", "resource-name"))
        .append(new ElementCreator("input").id("resource-name").with("type", "text").with("value", resource.name))
        .append(new ElementCreator("label").text("Age").with("for", "resource-age"))
        .append(new ElementCreator("input").id("resource-age").with("type", "number").with("value", resource.age))
        .append(new ElementCreator("label").text("Is Wild").with("for", "resource-isWild"))
        .append(new ElementCreator("input").id("resource-isWild").with("type", "checkbox").with("checked", resource.isWild));

    // Add save button with event listener
    formCreator
        .append(new ElementCreator("button").text("Speichern").listener('click', (event) => {
            event.preventDefault();  // Prevent default form submission behavior

            // Part 2: Manually set the edited values
            resource.name = document.getElementById("resource-name").value;
            resource.age = document.getElementById("resource-age").value;
            resource.isWild = document.getElementById("resource-isWild").checked;

            // Part 3: Call the PUT endpoint to update the resource
            fetch(`/api/resources/${resource.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resource),  // Send updated resource as JSON
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update the resource on the server.');
                }
                return response.json();  // Parse the updated resource from server response
            })
            .then(updatedResource => {
                // Re-render the updated resource and exit edit mode
                add(updatedResource, document.getElementById(resource.idforDOM));

                // Get the parent container where the resource is located
                const parent = document.querySelector('main');

                // Replace the edit form with the updated resource element
                const editForm = document.getElementById(resource.idforDOM);
                parent.replaceChild(document.getElementById(updatedResource.idforDOM), editForm);

                // Optionally scroll to the updated resource
                window.scrollTo(0, 0);  // Scroll to top after saving (optional)
            })
            .catch(error => {
                console.error('Error updating resource:', error);
            });
        }));

    // Replace the current resource display with the edit form
    document.querySelector('main').replaceChild(formCreator.element, document.getElementById(resource.idforDOM));
}

function remove(resource) {
    document.getElementById(resource.idforDOM).remove();
}

/* Task 5 - Create a new resource is very similar to updating a resource. First, you add
   an empty form to the DOM with the exact same fields you used to edit a resource.
   Instead of PUTing the resource to the server, you POST it and add the resource that
   the server returns to the DOM (Remember, the resource returned by the server is the
    one that contains an id).
 */
function create() {
    alert("Not implemeted yet!");
}
    

document.addEventListener("DOMContentLoaded", function (event) {

    fetch("/api/resources")
        .then(response => response.json())
        .then(resources => {
            for (const resource of resources) {
                add(Object.assign(new Resource(), resource));
            }
        });
});

// This function is responsible for rendering a single resource (animal) in the UI
function renderAnimal(animal) {
    // Find the container where resources are displayed
    const container = document.getElementById('resource-list'); // Adjust this ID based on your HTML

    // Create a new div element for each resource
    const animalDiv = document.createElement('div');
    animalDiv.classList.add('animal');

    // Add animal properties to the div
    animalDiv.innerHTML = `
        <p><strong>Name:</strong> ${animal.name}</p>
        <p><strong>Age:</strong> ${animal.age}</p>
        <p><strong>Is Wild:</strong> ${animal.isWild ? 'Yes' : 'No'}</p>
        ${animal.adoptedOn ? `<p><strong>Adopted On:</strong> ${new Date(animal.adoptedOn).toLocaleDateString()}</p>` : ''}
        <button class="delete-button" data-id="${animal.id}">Delete</button>
        <button class="edit-button" data-id="${animal.id}">Edit</button>
    `;

    // Append the animal div to the container
    container.appendChild(animalDiv);
}

