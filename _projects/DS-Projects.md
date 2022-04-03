---
title: "Multiple projects regarding to Data Structures and Algorithms course"
excerpt: "Designing and implementation of:
the Red-Black Tree, 
the AVL Tree,
the Trie Dictionary, 
the Sparse Matrix via Linked List, 
the Rat in the maze problem"
collection: expressions
---

## The Rat in the maze problem
* Code is not available at github.  
Let us consider a rat placed at (0, 0) in a square matrix of order N * N. Let us say it has to reach a destination at (N – 1, N – 1). Find all paths the rat can take to reach its destination from its source. There are four directions that the rat can move in: up, down, left, and right. At a cell in the matrix, value 0 indicates that it is blocked and the rat cannot access it, while value 1 indicates that it can pass through it. In a path, no cell can be visited more than once.
![image](https://raw.githubusercontent.com/benymaxparsa/Quera.ir/master/Ug5scX1dga-pathset.png)

## The Sparse Matrix via Linked List
* [Github repo](https://github.com/benymaxparsa/SparseMatrix-class-using-LinkedList)  
The usage of a 2D array to represent a sparse matrix wastes a lot of resources because the zeroes in the matrix are rarely used. As a result, we only store non-zero elements instead of storing zeroes with them. This entails using triples to store non-zero elements (Row, Column, value). There are two pointers that lead in two different directions to the following nodes.
![image](https://raw.githubusercontent.com/benymaxparsa/Quera.ir/master/3992%20-%20TA/DS/project%202%20sparse/matrix.png)

## The Trie Dictionary
* [Github repo](https://github.com/benymaxparsa/trie-dictionary)  
The word "Trie" is an abbreviation for "retrieval." The set of strings is stored in a sorted tree-based data structure called a trie. Each node has the same number of pointers as the number of characters in the alphabet. It may use the prefix of a word to look up that word in the dictionary. If we suppose that all strings are made up of the letters a through z from the English alphabet, each trie node can have a maximum of 26 points.
The digital tree, or prefix tree, is another name for Trie. The key with which a node is associated is determined by its position in the Trie.
![image](https://raw.githubusercontent.com/benymaxparsa/Quera.ir/master/3992%20-%20TA/DS/Project%203%20Dictionary/fullTree.png)
![gif](https://raw.githubusercontent.com/benymaxparsa/Quera.ir/master/3992%20-%20TA/DS/Project%203%20Dictionary/trie_gif.gif)

## The AVL Tree
* [Github repo](https://github.com/benymaxparsa/AVL-Tree)  
The AVL tree is a self-balancing binary search tree in which each node keeps track of additional information termed a balance factor, which might be -1, 0 or +1.
![image](https://raw.githubusercontent.com/benymaxparsa/Quera.ir/master/3992%20-%20TA/DS/AVL/avl-tree2.png)

## The Red-Black Tree
* [Github repo](https://github.com/benymaxparsa/Red-Black-Tree)  
The red-black tree is a self-balancing binary search tree in which each node has an extra bit to indicate whether it is red or black.
![](https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Red-black_tree_example_with_NIL.svg/1920px-Red-black_tree_example_with_NIL.svg.png)

