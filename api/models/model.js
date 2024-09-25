/* A class representing your resource. At the moment, its name is Resource. But you
   can (and probalby should) rename it to whatever you are going to use as a Resource.
   At the moment the example resource has only a name. You can delete this property
   if you don't need it.

   Task 1 - Part 1: Replace the Resource class with a new class of your choosing, that
   has at least three properties: one string property, one number property, one boolean
   property, and - optionally - a date property.
   Then, adapt the initialization of the data at the end of this file (Task 2 - Part 2)
   so that you have some instances of your object available that can be served to the client.
 */
// Inside api/models/model.js

class Animal {
    constructor(name, age, isWild, adoptedOn = null) {
        this.name = name;          // String property
        this.age = age;            // Number property
        this.isWild = isWild;      // Boolean property
        this.adoptedOn = adoptedOn; // Optional Date property
    }
}

/* A model managing a map of resources. The id of the object is used as key in the map. */
class Model {
    static ID = 1;

    constructor() {
        this.resources = new Map();
    }

    add(resource) {
        resource.id = Model.ID++;
        this.resources.set(resource.id, resource);
    }

    get(id) {
        this.checkId(id);
        return this.resources.get(id);
    }

    getAll() {
        return Array.from(this.resources.values());
    }

    checkId(id) {
        if (typeof id !== "number") {
            throw new Error(`Given id must be a number, but is a ${typeof id}`);
        }
    }

    create(resource) {
        this.add(resource);
        return resource;    
    }

    update(id, resource) {
        this.checkId(id);

        const target = this.resources.get(id);
        if (!target) {
            throw new Error(`Resource with ${id} does not exist and cannot be updated.`);
        }

        Object.assign(target, resource);
        return target;
    }

    delete(id) {
        this.checkId(id);
        return this.resources.delete(id);
    }
}

// Create a new instance of the Model to manage Animal objects
const model = new Model();

/* 
 * Task 1 - Part 2: Replace these three instances of the example class Resource with instances
 * of your own class.
 * Here we add instances of the Animal class to the model.
 */
const animals = [
    new Animal('Lion', 5, true, new Date('2020-01-01')),
    new Animal('Dog', 3, false, new Date('2022-06-15')),
    new Animal('Elephant', 10, true)
];

// Adding the animals to the model
animals.forEach(animal => model.add(animal));

/* Export the model so it can be used in other parts of the application, like the controller */
module.exports = model;