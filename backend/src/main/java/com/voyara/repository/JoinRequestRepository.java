package com.voyara.repository;

import com.voyara.entity.JoinRequest;
import com.voyara.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findBySender(User sender);
    List<JoinRequest> findByHost(User host);
    List<JoinRequest> findBySenderOrHost(User sender, User host);
}
