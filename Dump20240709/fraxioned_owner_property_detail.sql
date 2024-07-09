-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 192.168.1.47    Database: fraxioned
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `owner_property_detail`
--

DROP TABLE IF EXISTS `owner_property_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owner_property_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_property_id` int NOT NULL,
  `PSUN` int NOT NULL DEFAULT '0',
  `PSBN` int NOT NULL DEFAULT '0',
  `PSCN` int NOT NULL DEFAULT '0',
  `PSLN` int NOT NULL DEFAULT '0',
  `PSRN` int NOT NULL DEFAULT '0',
  `PSUHN` int NOT NULL DEFAULT '0',
  `PSBHN` int NOT NULL DEFAULT '0',
  `PSRHN` int NOT NULL DEFAULT '0',
  `OSUN` int NOT NULL DEFAULT '0',
  `OSBN` int NOT NULL DEFAULT '0',
  `OSCN` int NOT NULL DEFAULT '0',
  `OSLN` int NOT NULL DEFAULT '0',
  `OSRN` int NOT NULL DEFAULT '0',
  `OSUHN` int NOT NULL DEFAULT '0',
  `OSBHN` int NOT NULL DEFAULT '0',
  `OSRHN` int NOT NULL DEFAULT '0',
  `LMBN` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `owner_property_detail_fk1` (`owner_property_id`),
  CONSTRAINT `owner_property_detail_fk1` FOREIGN KEY (`owner_property_id`) REFERENCES `owner_property` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owner_property_detail`
--

LOCK TABLES `owner_property_detail` WRITE;
/*!40000 ALTER TABLE `owner_property_detail` DISABLE KEYS */;
INSERT INTO `owner_property_detail` VALUES (1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),(2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),(3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),(4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),(5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
/*!40000 ALTER TABLE `owner_property_detail` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-09 12:13:26
