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
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `seconday_phone` varchar(255) DEFAULT NULL,
  `secondary_email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `address1` varchar(255) NOT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `state` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `zip` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` timestamp NULL DEFAULT NULL,
  `last_login_time` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'John','Doe','John','123-456-7890','johnson.selvakumar@tringapps.net','098-765-4321','john@gmail.com','$2b$10$qgF3VONI1wUDAYRIYlpPQO/DW9YXf7yGQAbvO.ZTEVSKnBsVCqOa.','123 Main St','Apt 4B','CA','Los Angeles','90001','http://example.com/images/john_doe.jpg',1,'24f8717a5e6ad86746348d89a889b889baab1450640ff4a7dbcf0a9f108d7e5d735b1416e9dc805cca68e94bc600f1194597','2024-06-14 14:17:10',NULL,'2024-06-07 10:58:07',NULL,'2024-06-14 13:16:46'),(2,'Sivabharathi','Palanisamy','sivabharathi.palanisamy@tringapps.com','0987654321','sivabharathi.palanisamy@tringapps.com','9876543212','bsiva1773@gmial.com','$2b$10$c77SF7sgjNrQWcRPCpgP4ONau5N/YYCys1k0qWfPqhO36MUIKxaQq','polampatti','salme','tamil','salem','12345','',1,NULL,NULL,NULL,'2024-06-10 07:27:46',NULL,'2024-06-18 09:10:17'),(6,'Sasi','Kumar','sasi','5432167890','bsiva1773@gmail.com','6543219876','siva@gmial.com','$2b$10$85GFIrj5n/m1RPuZCxMFGe/irh9h9GPU1Ri5RCcADeVI/CE8TMRpW','Kannakaradu , Kuppanoor, Poolampatti(PO),Edappadi(TK)','polammpatti','Tamil Nadu','Salem','63710','',1,NULL,NULL,NULL,'2024-06-10 07:37:44',NULL,'2024-06-18 10:16:15'),(7,'Bala','Siva','bsiva1773@gmail.com','0790400311','sandhya.k@tringapps.net','0790400316','siva@gmial.com','$2b$10$UVindRfUOOuoHc6ZTJJxTuerCODCBNow31qV8e.Q/IR52xR6gsv/i','Kannakaradu , Kuppanoor, Poolampatti(PO),Edappadi(TK)','polammpatti','Tamil Nadu','Salem','63710','',1,NULL,NULL,NULL,'2024-06-11 07:07:21',NULL,'2024-06-18 06:33:09'),(8,'Sandhya','K','sandhya','6543217890','sandhyakalai6422@gmail.com','0987654321','sandhya.k@tringapps.net','$2b$10$gjJ4bOrzbg3CRg7ODyorU.zhYejw7quRthw/Q8SN5fuJPhJIXxeL6','chennai','koyambedu','andhra','renikonda','12345','',1,NULL,NULL,NULL,'2024-06-11 08:39:43',NULL,'2024-06-14 08:58:03'),(9,'Dhayanithi','devi','Dhayanithi devi','76796879875','dhayanithidevik158@gmail.com','3245678988','sandhya.k@tringapps.net','$2b$10$LyK8lGoPG1foz4ck.ccRXO683vfaXgeGeMIe04rIeO0Rf/cfcihoy','trdgtfyjug','ghvgjvjnh','tamilnadu','chennai','345678','fcgvbnmm,',1,NULL,NULL,NULL,'2024-06-18 09:46:05',NULL,'2024-06-18 09:46:05'),(10,'Gowtham','J','Gowtham Jeff','4567879080','sivabharathi899@gmail.com','3245678988','sandhya.k@tringapps.net','$2b$10$ZbvQjSPA4YPT7d..aM.aSuhRL81p9LoghW2Jd61zSEeIgvfvykxOO','trdgtfyjug','ghvgjvjnh','tamilnadu','chennai','345678','fcgvbnmm,',1,NULL,NULL,NULL,'2024-06-18 10:39:56',NULL,'2024-06-18 10:39:56'),(11,'siva','p','siva','9876543212','kishore.s@tringapps.com','1234567887','bsiva1773@gmial.com','$2b$10$7OSBF3hMJqj0bjU1a1zhsuYDG1E4HxjaBF.umUL09y1Hkb7Up8aXy','polampatti','salme','tamil','salem','12345','',1,NULL,NULL,NULL,'2024-06-18 10:51:46',NULL,'2024-06-18 10:51:46'),(12,'Anand','R','Anand','5446768270','anandth.ravichandran@tringapps.net','1234566778','sandhya.k@tringapps.net','$2b$10$hLeyQqe/eN6oGCX1ljFEBuYF1Qa8AwoPsyaVXGJyXnxS7QVIdvw/K','dsfgrgtb','aqsef','tn','Chennai','76876','',1,NULL,NULL,NULL,'2024-06-18 11:24:13',NULL,'2024-06-18 11:27:13');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-19 10:29:06
