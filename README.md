# CrowdWire

## Context

With the emergence of Covid-19 all around the World, many people, companies and organizations started adopting remote procedures like video-conferences to continue doing the commons tasks they used to do "in person". Therefore, the search and use of these types of systems that allow video and voice calls has increased a lot. 


## Problem

Most of the current video communication systems are limited in the sense that they do not provide a remote interactive environment, side conversations, nor visualization that mimics real life behaviours. To solve this issue we want to incorporate, as much as possible, this component which is one of the most rewarding thing in real life meetings. Besides this, the ones that do, are not open source projects.


## Goals

With this work, we aim to provide an interactive way of doing virtual meetings, online conferences and classes, capable of scaling up to a  number of active users, that should be close enough to host conferences.
Also, we want to simulate a real-life communication experience by taking into consideration users' proximity.
In order to do so, we are looking forward to develop a web application with a game-like interface that allows to create and customize environments and invite other users.
As a solution to part of the problem, we intend to do a open-source project, so that people are able to use and contribute to it.


## Tasks

Module Backend (Bruno Bastos, Mário Silva, Daniel Gomes)
- Task 1: Identify the databases that will be used according to its use cases (Bruno Bastos)
- Task 2: Create the database schema (Bruno Bastos,Mário Silva)
- Task 3: Develop the API  and its endpoints (Daniel Gomes, Bruno Bastos)
- Task 4: Integrate with the Communications logic (Bruno Bastos, Mário Silva)

Module Frontend (Leandro Silva, Pedro Tavares)
- Task 1: Provide a static interface with an embedded game framework (Leandro Silva, Pedro Tavares)
- Task 2: Create the required communication services with the backend (Leandro Silva, Pedro Tavares)
- Task 3: Create dynamic pages and present information in real time where needed (Leandro Silva, Pedro Tavares)

Module Communications (Mário Silva, Daniel Gomes)
- Task 1: Investigate WebRTC technology to perform video and voice calls (Mário Silva)
- Task 2: Create the communications  Service (Mário Silva)
- Task 3: Integrate this microservice with the backend and frontend (Mário Silva, Daniel Gomes)

Module Infrastructure (Daniel Gomes, Mário Silva)
- Task 1: Identify the technologies that are needed to deploy every micro-service (Daniel Gomes)
- Task 2: Investigate how to increase the communications service availability in the production environment (Daniel Gomes)
- Task 3: CI Pipeline (Daniel Gomes, Mário Silva)
- Task 4: CD Pipeline (Daniel Gomes)

Module World-Editor (Leandro Silva, Pedro Tavares)
- Task 1: Provide the user with a map editor and material to create and edit its personal world (Leandro Silva, Pedro Tavares)
- Task 2: Allow users to upload sprites to their editor (Leandro Silva)


## Expected Results

In the final result, we expect to have a fully functional web application capable of performing video and voice calls that may be used in many different ways, providing to the end users other kind of interaction with each other.

The end application should allow the user to create and edit their own worlds and invite friends, co-workers or guests depending on the world's intent, which can go from speeches to workplaces, conferences, classes or maybe even playgrounds.

Finally, this platform should  be scalable enough to host video-conferences with dimensions of an event like Students@Deti.


## Related Work

The following system is really interesting and inspiring in the context of our project:
- [**Gather.town**](https://gather.town/)
- [**DogeHouse**](https://dogehouse.tv/)


## Calendar

### 1st Milestone
- Planning...
- Set up docs platforms tools..
- Develop a prototype
- Research technologies and define the system architecture
- Start testing and developing shortly each area/framework individually

### 2nd Milestone
- Basic User movement on predefined maps
- Basic Video and voice communication
- Text Chat feature

### 3rd Milestone
- World-Editor
- Full Integration of each micro-service
- Proximity video and voice chatting with high availability
- CI/CD
- File Exchange feature

### 4th Milestone
- Map and User Permissions well integrated
- Stress Testing to all features
- Integrate additional features
 

## Communication

Backlog Management: For backlog management we decided to use Jira since it is a widely used tool by a lot of Companies as a project Management tool that allows bug/issue tracking.
Git Platform: For the Git platform, we have chosen GitHub since we are very acquainted with it.
Git Standards:
- For each new feature create a new branch.
- For each fix create a new branch.
- Never merge directly, always make pull requests and identify at least one person to check (review) that pull request before merging the PR.
- New feature branch: For each new feature create a branch following the standard, example: feature-frontend-feature-name.
- New Issue branch: For each fix create a branch following the standard, example: hotfix-frontend-fix-name.
- Follow the Good Practices stablished for most of the Open Source Projects.
- Always have instructions for running all services on local host.
- For each pull request it's assigned a member to revise the code and merge it, we decided to use a Round Robin policy for the assignment of the reviewer.

Team Communication: For intra-team communication we are using Discord, since every member is familiarized with the tool and, we have integrated it with Jira and GitHub for continuous updates on our repository.


## Team Roles

**Product Owner**: Leandro Silva
**DevOps Master**: Daniel Gomes
**Architect**: Bruno Bastos
**Lead Developer**: Mário Silva
**Project Manager**: Pedro Tavares
**Advisor**: Diogo Gomes


##  Project Calendar

### Personas

| Name  | Details | Goals |
| :--:  |:--      |:--    |
| Alice | Professor, 33 years old,lives in Aveiro.With the current pandemic situation that the world lives in, she has been struggling to make her classes similar to the "in person" ones. | Wants to teach in a more interactive way in order to make the students more interested in the classes.                |
| John  | 45 years old, resident in Porto, Team Manager of a remote Software company and  needs to communicate with the rest of the team                                                    | Wants to organize remote meetings with the team members, sharing valuable information or documents.                   |
| David | 16 years old teenager, lives in Porto and is a really sociable person, that misses his friends and seems frustrated due to the lack of contact that the pandemic provided.          | Wants to meet with his friends in this platform so that they have fun remotely, simulating a live presence with them. |
Mary | 24 years old, lives in Coimbra. Gives motivational speeches in conferences with hundreds of people.  | Wants to host a meeting for a large number of people and wants them to feel a more realistic depth to their presences.


### User Stories

- As Alice I want to be able to connect with my students in a room, where all of them can hear/see me.
- As Alice I want to be able to share my screen, so that all students can see the exercises.
- As Alice I do not want to lose too much time creating and customizing a map, therefore it would be nice to have default classroom maps.
- As Alice I want to have some kind of whiteboard in order to make it easy to explain some subjects to the students.
- As John I need to invite my team to a private room, so that only the invited people can join it.
- As John I would like to have a text Chat mechanism, so that I can share links in a simple way.
- As John I need to share documents with my team, so that these documents can only be seen by the team.
- As John I want to edit my profile so that I am able to control information associated with my account.
- As David I would like to be able to hear and see my friends' cameras everytime they are close to me in the map.
- As David I want to turn off my camera and microphone when I need to be out for a while.
- As David I want to customize my World Avatar, so that I can represent myself in this system.
- As David I want to be able to invite my friends to my map, so that we can communicate with each other.
- As David I want to customize my own map with any kind of assets, so that it resembles my real life playground.
- As Mary I want to talk to everyone in the room, so that I can give a speech.
- As Mary I want to be able to give permission for someone who raised their hand to talk, so that they can share their opinion on my speeches.
- As Mary I want to set default settings to my world, in order to manage more easily my conferences.
