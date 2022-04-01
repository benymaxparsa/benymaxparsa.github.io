---
title: "Two projects regarding to Introduction to Information Retrieval & Web Search course"
excerpt: "Projects:
The Scrapy Crawler, 
Inverted Index Construction using BSBI Algorithm"
collection: projects
---
 

## The Scrapy Crawler
* [Github repo](https://github.com/benymaxparsa/Web-Crawler)  
In order to create a search engine, we need to use crawlers that visit websites and crawl their content. These crawlers then store it in our repository so that it can later be used to index documents.  
This crawler will be built using a Python framework called Scrapy.
![image](https://user-images.githubusercontent.com/51443025/161238768-906d3478-1aa9-46df-8900-0d1f4d59d1fa.png)

## Inverted Index Construction using BSBI Algorithm
* [Github repo](https://github.com/benymaxparsa/Inverted-Index-Construction)  
Large collections that rely on secondary storage require an external sorting algorithm to do as few disk seeks as possible during sorting. This is due to the fact that sequential disk reads are faster than single-unit reads. The blocked sort-based indexing algorithm (also known as BSBI) can solve this problem.  
In BSBI, the collection is segmented into blocks of equal size, the termID-docID pairs for each block are sorted in memory, intermediate sorted results are stored on disk, and ultimately the final index is merged from all intermediate results.  
The sorting time complexity of BSBI is O( T * Log_2 T) where T represents the maximum number of items to sort (the number of termID–docID pairs). While indexing is typically a lengthy task, it is largely dependent on how long it takes to parse documents (ParseNextBlock) and merge them (MergeBlocks).
![](https://raw.githubusercontent.com/benymaxparsa/Inverted-Index-Construction/main/Screenshots/end.jpg)
![](https://raw.githubusercontent.com/benymaxparsa/Inverted-Index-Construction/main/Screenshots/output2.jpg)

