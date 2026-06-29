package com.voyara.repository;

import com.voyara.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findAllByOrderByIdDesc();
    
    List<Trip> findByDestinationContainingIgnoreCase(String destination);
    
    List<Trip> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
    
    List<Trip> findByDestinationContainingIgnoreCaseAndTitleContainingIgnoreCase(String destination, String title);
}
